import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Hash, FileText, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/Layouts/MainLayout';
import { searchAPI } from '@/api/search.api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ communities: [], posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchAPI.searchAll(searchQuery.trim(), 20);
      setResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ communities: [], posts: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const handleResultClick = (type, id) => {
    if (type === 'community') {
      navigate(`/g/${id}`);
    } else if (type === 'post') {
      navigate(`/post/${id}`);
    } else if (type === 'user') {
      navigate(`/user/${id}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search communities, posts, or users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-border focus:border-primary"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              disabled={!query.trim()}
            >
              Search
            </Button>
          </form>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Searching...</p>
          </div>
        ) : query ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="communities">
                Communities ({results.communities.length})
              </TabsTrigger>
              <TabsTrigger value="posts">
                Posts ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Users ({results.users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Communities Preview */}
              {results.communities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.communities.slice(0, 3).map((community) => (
                      <div
                        key={community._id}
                        onClick={() => handleResultClick('community', community.name)}
                        className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.avatar?.secure_url} />
                          <AvatarFallback>
                            {community.title?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">g/{community.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {community.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {community.members_count} members
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.communities.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('communities')}
                        className="w-full"
                      >
                        View all {results.communities.length} communities
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Posts Preview */}
              {results.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.posts.slice(0, 3).map((post) => (
                      <div
                        key={post._id}
                        onClick={() => handleResultClick('post', post._id)}
                        className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.author_id?.avatar?.secure_url} />
                            <AvatarFallback className="text-xs">
                              {post.author_id?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>g/{post.community_id?.name}</span>
                          <span>•</span>
                          <span>u/{post.author_id?.username}</span>
                        </div>
                      </div>
                    ))}
                    {results.posts.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('posts')}
                        className="w-full"
                      >
                        View all {results.posts.length} posts
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Users Preview */}
              {results.users.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.users.slice(0, 3).map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleResultClick('user', user._id)}
                        className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar?.secure_url} />
                          <AvatarFallback>
                            {user.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">u/{user.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.num_posts} posts • {user.num_comments} comments
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.users.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('users')}
                        className="w-full"
                      >
                        View all {results.users.length} users
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="communities" className="space-y-4">
              {results.communities.map((community) => (
                <Card key={community._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent
                    className="p-4"
                    onClick={() => handleResultClick('community', community.name)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={community.avatar?.secure_url} />
                        <AvatarFallback className="text-lg">
                          {community.title?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">g/{community.name}</h3>
                        <p className="text-muted-foreground mt-1">{community.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{community.members_count} members</span>
                          <span>•</span>
                          <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {results.posts.map((post) => (
                <Card key={post._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent
                    className="p-4"
                    onClick={() => handleResultClick('post', post._id)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author_id?.avatar?.secure_url} />
                        <AvatarFallback className="text-xs">
                          {post.author_id?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>g/{post.community_id?.name}</span>
                      <span>•</span>
                      <span>u/{post.author_id?.username}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.body && (
                      <p className="text-muted-foreground line-clamp-2">{post.body}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {results.users.map((user) => (
                <Card key={user._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent
                    className="p-4"
                    onClick={() => handleResultClick('user', user._id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar?.secure_url} />
                        <AvatarFallback className="text-lg">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">u/{user.username}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{user.num_posts} posts</span>
                            <span>•</span>
                            <span>{user.num_comments} comments</span>
                          </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search Global Bene</h2>
            <p className="text-muted-foreground">
              Find communities, posts, and users that match your interests.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;