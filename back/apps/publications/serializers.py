"""
Publications serializers
"""
from rest_framework import serializers
from .models import Publication, Category, Like, Comment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'icon', 'description']
        read_only_fields = ['slug']


class AuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(source='nom')
    avatar = serializers.SerializerMethodField()
    
    def get_avatar(self, obj):
        return None  # TODO: ajouter avatar


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'replies']
    
    def get_replies(self, obj):
        replies = obj.replies.filter(status=Comment.Status.APPROVED)
        return CommentSerializer(replies, many=True).data


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content', 'parent']


class PublicationSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'type', 'status',
            'author', 'categories', 'cover_image', 'images',
            'is_featured', 'allow_comments',
            'meta_title', 'meta_description',
            'published_at', 'scheduled_at',
            'views_count', 'likes_count', 'comments_count', 'is_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'views_count', 'likes_count', 'comments_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PublicationCreateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Publication
        fields = [
            'title', 'excerpt', 'content', 'type', 'status',
            'category_ids', 'cover_image', 'images',
            'is_featured', 'allow_comments',
            'meta_title', 'meta_description', 'scheduled_at'
        ]
    
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        publication = Publication.objects.create(**validated_data)
        
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            publication.categories.set(categories)
        
        return publication
    
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if category_ids is not None:
            categories = Category.objects.filter(id__in=category_ids)
            instance.categories.set(categories)
        
        return instance
