
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CreatePostModal from '@/components/post/CreatePostModal';
import PostList from '@/components/post/PostList';
import SearchBar from '@/components/post/SearchBar';
import PostsLoading from '@/components/post/PostsLoading';
import { fetchPosts } from '@/services/postService';

const Home = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['allPosts'],
    queryFn: fetchPosts
  });
  
  useEffect(() => {
    if (posts.length > 0) {
      if (!searchQuery) {
        setFilteredPosts(posts);
        return;
      }
      
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(post => 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.user.name && post.user.name.toLowerCase().includes(query)) ||
        (post.community_name && post.community_name.toLowerCase().includes(query))
      );
      
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  const handlePostCreation = (content, type, comicData) => {
    console.log('Post created:', { content, type, comicData });
    setShowCreatePostModal(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <Button 
            onClick={handleCreatePost}
            className="bg-vice-purple hover:bg-vice-dark-purple"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Create Post
          </Button>
        </div>
        
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        {isLoading ? (
          <PostsLoading />
        ) : (
          <PostList 
            posts={filteredPosts}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            onCreatePost={handleCreatePost}
          />
        )}
      </div>
      
      {showCreatePostModal && (
        <CreatePostModal 
          onClose={() => setShowCreatePostModal(false)}
          onPost={handlePostCreation}
        />
      )}
    </div>
  );
};

export default Home;
