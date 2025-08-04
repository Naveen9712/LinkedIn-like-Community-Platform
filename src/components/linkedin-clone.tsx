import { useState, useEffect, createContext, useContext } from 'react';
import { User, Home, LogOut, Edit2, Calendar, Mail, Users, MessageSquare, Heart, Share2 } from 'lucide-react';

// Mock Data Storage (simulating backend)
const mockStorage = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      bio: 'Full Stack Developer passionate about React and Node.js. Love building scalable applications.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2', 
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      bio: 'UI/UX Designer creating beautiful and intuitive user experiences.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2e96e21?w=150&h=150&fit=crop&crop=face'
    }
  ],
  posts: [
    {
      id: '1',
      authorId: '1',
      authorName: 'John Doe',
      content: 'Just launched my new React project! Excited to share it with the community. 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      likes: 12,
      comments: 3
    },
    {
      id: '2',
      authorId: '2', 
      authorName: 'Jane Smith',
      content: 'Working on some amazing UI designs today. The creative process never gets old! ✨',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes: 8,
      comments: 1
    }
  ]
};

// Auth Context
const AuthContext = createContext<any>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Service
const authService = {
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    const user = mockStorage.users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const existingUser = mockStorage.users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      bio: 'New to the platform!',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
    };
    
    mockStorage.users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
  }
};

// Post Service
const postService = {
  getAllPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStorage.posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  createPost: async (content: string, authorId: string, authorName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPost = {
      id: Date.now().toString(),
      authorId,
      authorName,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    mockStorage.posts.unshift(newPost);
    return newPost;
  },

  getUserPosts: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStorage.posts
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};

// User Service
const userService = {
  getUserById: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStorage.users.find(u => u.id === userId);
  },

  updateUserBio: async (userId: string, bio: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockStorage.users.find(u => u.id === userId);
    if (user) {
      user.bio = bio;
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  }
};

// Toast Context
const ToastContext = createContext<any>(null);

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {message}
    </div>
  );
};

// Main LinkedIn Clone Component
const LinkedInClone = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const authContextValue = {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login: async (email: string, password: string) => {
      setLoading(true);
      try {
        const result = await authService.login(email, password);
        if (result.success) {
          setCurrentUser(result.user);
          setCurrentPage('home');
          showToast('Login successful!');
        } else {
          showToast(result.error || 'Login failed', 'error');
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
    register: async (userData: any) => {
      setLoading(true);
      try {
        const result = await authService.register(userData);
        if (result.success) {
          setCurrentUser(result.user);
          setCurrentPage('home');
          showToast('Registration successful!');
        } else {
          showToast(result.error || 'Registration failed', 'error');
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
    logout: () => {
      setCurrentUser(null);
      setCurrentPage('login');
      showToast('Logged out successfully!');
    }
  };

  const toastContextValue = {
    showToast,
    hideToast
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ToastContext.Provider value={toastContextValue}>
        <div className="min-h-screen bg-gray-50">
          {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
          <Router currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
};

// Router Component
const Router = ({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) => {
  const { currentUser } = useAuth();

  // Route protection
  useEffect(() => {
    if (!currentUser && !['login', 'register'].includes(currentPage)) {
      setCurrentPage('login');
    }
  }, [currentUser, currentPage, setCurrentPage]);

  const renderPage = () => {
    if (!currentUser && ['login', 'register'].includes(currentPage)) {
      return currentPage === 'login' ? 
        <LoginPage setCurrentPage={setCurrentPage} /> : 
        <RegisterPage setCurrentPage={setCurrentPage} />;
    }

    if (currentUser) {
      switch (currentPage) {
        case 'home':
          return <HomePage setCurrentPage={setCurrentPage} />;
        case 'profile':
          return <ProfilePage setCurrentPage={setCurrentPage} />;
        default:
          return <HomePage setCurrentPage={setCurrentPage} />;
      }
    }

    return <LoginPage setCurrentPage={setCurrentPage} />;
  };

  return renderPage();
};

// Login Page
const LoginPage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) return;
    await login(formData.email, formData.password);
  };

  const handleDemoLogin = async () => {
    await login('john@example.com', 'password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Demo Login (John Doe)
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentPage('register')}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { register, loading } = useAuth();

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    await register(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join our community</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentPage('login')}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">ConnectHub</span>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'home' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'profile' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home Page
const HomePage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await postService.getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setPosting(true);
    try {
      const newPost = await postService.createPost(
        newPostContent.trim(),
        currentUser.id,
        currentUser.name
      );
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      showToast('Post created successfully!');
    } catch (error) {
      showToast('Failed to create post', 'error');
    } finally {
      setPosting(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="home" setCurrentPage={setCurrentPage} />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleCreatePost}
                  disabled={posting || !newPostContent.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={mockStorage.users.find(u => u.id === post.authorId)?.avatar}
                    alt={post.authorName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                      <span className="text-gray-500 text-sm">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatTimestamp(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-4">{post.content}</p>
                    
                    <div className="flex items-center space-x-6 text-gray-500">
                      <button className="flex items-center space-x-2 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-blue-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-green-500">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to share something!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [saving, setSaving] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const posts = await postService.getUserPosts(currentUser.id);
      setUserPosts(posts);
      setNewBio(currentUser.bio || '');
    } catch (error) {
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const result = await userService.updateUserBio(currentUser.id, newBio);
      if (result.success) {
        setCurrentUser({ ...currentUser, bio: newBio });
        setEditing(false);
        showToast('Bio updated successfully!');
      } else {
        showToast('Failed to update bio', 'error');
      }
    } catch (error) {
      showToast('Failed to update bio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="profile" setCurrentPage={setCurrentPage} />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start space-x-6">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentUser?.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Mail className="w-4 h-4 mr-2" />
                {currentUser?.email}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Bio</h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
                
                {editing ? (
                  <div className="space-y-3">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveBio}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setNewBio(currentUser.bio || '');
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800">{currentUser?.bio || 'No bio yet.'}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {userPosts.length} posts
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Connected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Posts</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading posts...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{post.authorName}</h4>
                        <span className="text-gray-500 text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatTimestamp(post.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      
                      <div className="flex items-center space-x-6 text-gray-500">
                        <button className="flex items-center space-x-2 hover:text-red-500">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-blue-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {userPosts.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Start sharing your thoughts with the community!</p>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create your first post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInClone;