import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../actions/postActions';
import { Link, useParams } from 'react-router-dom';
import { useSpring, useTrail, animated } from 'react-spring';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Draggable from 'react-draggable';
import { Helmet } from 'react-helmet';
import '../styles/CategoryPage.css';

const ChatWindow = ({ id, category, filteredPosts, onClose, initialPosition }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem(`chat-${category}-${id}`)) || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [suggestedPost, setSuggestedPost] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [chatSize, setChatSize] = useState({ width: 380, height: 550 });

    useEffect(() => {
        localStorage.setItem(`chat-${category}-${id}`, JSON.stringify(messages));
    }, [messages, category, id]);

    const chatAnimation = useSpring({
        opacity: 1,
        transform: isMinimized ? 'scale(0.9)' : 'scale(1)',
        config: { tension: 200, friction: 20 }
    });

    const sendMessageToGemini = async (message, isPostSuggestion = false) => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message, id: Date.now(), timestamp: new Date().toLocaleTimeString() };
        if (!isPostSuggestion) setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const postTitles = filteredPosts.map(post => post.title).join(', ');
        const formatInstruction = "Respond in a concise, organized markdown format. Use `-` for bullet points, numbered lists where applicable, `**` for bold headings/emphasis, and ```language for code blocks (e.g., ```javascript).";
        const context = isPostSuggestion
            ? `${formatInstruction} Suggest a creative post title and brief description for the category "${category}". Current posts: ${postTitles || 'None'}.`
            : `${formatInstruction} You are a creative AI assistant on a page for the category "${category}". Current posts: ${postTitles || 'None'}. User query: ${message}`;

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBsEIJ38VxWk_o5FbbOUP0WS7MCt5-bSX8', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            if (isPostSuggestion) {
                setSuggestedPost(aiResponse);
            } else {
                setMessages(prev => [...prev, { sender: 'ai', text: aiResponse, id: Date.now(), timestamp: new Date().toLocaleTimeString() }]);
            }
        } catch (error) {
            console.error('Error fetching Gemini API:', error);
            const errorMsg = { sender: 'ai', text: 'Oops, my circuits got tangled. Try again!', id: Date.now(), timestamp: new Date().toLocaleTimeString() };
            if (isPostSuggestion) setSuggestedPost('Error generating suggestion.');
            else setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) sendMessageToGemini(input);
    };

    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speech = recognition ? new recognition() : null;

    if (speech) {
        speech.continuous = false;
        speech.interimResults = false;
        speech.onresult = (event) => {
            setInput(event.results[0][0].transcript);
            setIsListening(false);
        };
        speech.onerror = () => setIsListening(false);
        speech.onend = () => setIsListening(false);
    }

    const toggleVoiceInput = () => {
        if (!speech) return alert('Speech recognition not supported.');
        if (isListening) speech.stop();
        else {
            setIsListening(true);
            speech.start();
        }
    };

    const startEditing = (msg) => {
        if (msg.sender === 'user') {
            setEditingMessageId(msg.id);
            setEditedText(msg.text);
        }
    };

    const saveEditedMessage = (msgId) => {
        if (editedText.trim()) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === msgId ? { ...msg, text: editedText, timestamp: new Date().toLocaleTimeString() } : msg
                )
            );
            sendMessageToGemini(editedText);
        }
        setEditingMessageId(null);
        setEditedText('');
    };

    const deleteMessage = (msgId) => {
        setMessages(prev => prev.filter(msg => msg.id !== msgId));
    };

    const suggestedPrompts = [
        `Craft a wild story inspired by "${category}"!`,
        `What’s the strangest fact about "${category}"?`,
        `Imagine "${category}" as a sci-fi universe—what happens?`
    ];

    const handlePromptClick = (prompt) => {
        setInput(prompt);
        sendMessageToGemini(prompt);
    };

    const generatePostSuggestion = () => {
        sendMessageToGemini(`Suggest a post for "${category}"`, true);
    };

    const handleResize = (e) => {
        const newWidth = Math.max(300, Math.min(600, e.target.offsetWidth));
        const newHeight = Math.max(400, Math.min(800, e.target.offsetHeight));
        setChatSize({ width: newWidth, height: newHeight });
    };

    const resetSize = () => {
        setChatSize({ width: 380, height: 550 });
    };

    return (
        <Draggable handle=".chat-header" bounds="parent">
            <animated.div
                style={{
                    ...chatAnimation,
                    width: `${chatSize.width}px`,
                    height: isMinimized ? '60px' : `${chatSize.height}px`,
                    position: 'absolute',
                    top: `${initialPosition.top}px`,
                    left: `${initialPosition.left}px`,
                    zIndex: isPinned ? 1002 : 1001,
                }}
                className="chat-standalone"
                onMouseUp={handleResize}
            >
                <div className="chat-header">
                    <h3>AI Help ChatBot #{id}</h3>
                    <div className="chat-controls">
                        <button className="pin-btn" onClick={() => setIsPinned(!isPinned)}>
                            {isPinned ? '📍' : '📌'}
                        </button>
                        <button className="reset-btn" onClick={resetSize}>⟳</button>
                        <button className="toggle-btn" onClick={() => setIsMinimized(!isMinimized)}>
                            {isMinimized ? '□' : '–'}
                        </button>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                </div>
                {!isMinimized && (
                    <div className="chat-content">
                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                                >
                                    <div className="message-content">
                                        {editingMessageId === msg.id ? (
                                            <div className="edit-message">
                                                <input
                                                    type="text"
                                                    value={editedText}
                                                    onChange={(e) => setEditedText(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && saveEditedMessage(msg.id)}
                                                />
                                                <button onClick={() => saveEditedMessage(msg.id)}>Save</button>
                                                <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.sender === 'ai' ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return !inline && match ? (
                                                                    <SyntaxHighlighter
                                                                        style={oneDark}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    msg.text
                                                )}
                                                <span className="message-timestamp">{msg.timestamp}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="message-actions">
                                        {msg.sender === 'user' && (
                                            <button className="edit-btn" onClick={() => startEditing(msg)}>
                                                Edit
                                            </button>
                                        )}
                                        <button className="delete-btn" onClick={() => deleteMessage(msg.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="chat-loading">AI is crafting a masterpiece...</div>}
                        </div>
                        <div className="chat-suggestions">
                            {suggestedPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    className="suggestion-btn"
                                    onClick={() => handlePromptClick(prompt)}
                                    disabled={isLoading}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <div className="post-suggestion-area">
                            <button
                                className="post-suggestion-btn"
                                onClick={generatePostSuggestion}
                                disabled={isLoading}
                            >
                                Suggest a Post
                            </button>
                            {suggestedPost && (
                                <div className="suggested-post">
                                    <strong>Suggested Post:</strong>
                                    <div className="suggested-post-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={oneDark}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {suggestedPost}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="chat-input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                disabled={isLoading}
                            />
                            <button
                                className="voice-btn"
                                onClick={toggleVoiceInput}
                                disabled={isLoading || !speech}
                            >
                                {isListening ? 'Stop' : '🎤'}
                            </button>
                            <button onClick={() => sendMessageToGemini(input)} disabled={isLoading}>
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </animated.div>
        </Draggable>
    );
};

const CategoryPage = () => {
    const { category } = useParams();
    const dispatch = useDispatch();
    const posts = useSelector(state => state.postReducer.posts);
    const [chatWindows, setChatWindows] = useState([]);

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);
    // Log the raw posts and category for debugging
  console.log('Raw posts from Redux:', posts);
  console.log('Category from useParams:', category);

   // Normalize category for case-insensitive matching
  const filteredPosts = posts.filter(
    (post) => post.category?.toLowerCase() === category.toLowerCase()
  );

  // Log filtered posts
  console.log('Filtered Posts for category', category, ':', filteredPosts);

  if (!posts) {
    return <div>Loading...</div>;
  }

  const getRelatedPosts = (currentPostId) => {
    console.log('getRelatedPosts called with postId:', currentPostId);
    const related = filteredPosts
      .filter(
        (post) =>
          post.postId && // Ensure postId exists
          post.postId !== currentPostId && // Compare with postId
          post.title && // Ensure title exists
          post.slug // Ensure slug exists
      )
      .slice(0, 3);
    console.log('Related posts:', related);
    return related;
  };

    if (!posts) {
        return <div>Loading...</div>;
    }

    const fadeIn = useSpring({
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: { duration: 1000 }
    });

    const trail = useTrail(filteredPosts.length, {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: { duration: 500 },
        delay: 1000
    });

    const openNewChat = () => {
        const newId = chatWindows.length + 1;
        const newPosition = {
            top: 100 + newId * 20,
            left: 100 + newId * 20,
        };
        setChatWindows(prev => [...prev, { id: newId, position: newPosition }]);
    };

    const closeChat = (id) => {
        setChatWindows(prev => prev.filter(chat => chat.id !== id));
    };

    // Capitalize category for display
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const metaTitle = `Learn ${capitalizedCategory} - Zedemy by Sanjay Patidar`;
    const metaDescription = `Explore ${capitalizedCategory} courses on Zedemy, founded by Sanjay Patidar. Learn, code, and grow with our modern educational platform.`;
    const canonicalUrl = `https://zedemy.vercel.app/category/${category}`;
    const fallbackImage = 'https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png';
   
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${capitalizedCategory} Category`,
        description: metaDescription,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Zedemy',
          founder: {
            '@type': 'Person',
            name: 'Sanjay Patidar',
          },
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: filteredPosts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'CreativeWork',
              name: post.title,
              url: `https://zedemy.vercel.app/post/${post.slug}`,
              image: post.titleImage || fallbackImage, // Include image in structured data
              relatedLink: getRelatedPosts(post.postId).map((relatedPost) => ({
                '@type': 'CreativeWork',
                name: relatedPost.title,
                url: `https://zedemy.vercel.app/post/${relatedPost.slug}`,
              })),
            },
          })),
        },
      };
    
      console.log('Structured Data:', structuredData);
    
      return (
        <animated.div style={fadeIn} className="category-page">
          <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content={`${category.toLowerCase()}, zedemy, sanjay patidar, online learning, coding, education, courses`}
        />
        <meta name="author" content="Sanjay Patidar" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png" />
        <meta property="og:site_name" content="Zedemy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png" />
        <link rel="icon" type="image/png" href="https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
          <nav className="breadcrumbs">
            <Link to="/">Home</Link> &gt; <span>{capitalizedCategory}</span>
          </nav>
          <h2 className="category-title">Category: {capitalizedCategory}</h2>
          {filteredPosts.length === 0 ? (
            <p className="no-posts">No posts found in this category personally tailored by us.</p>
          ) : (
            <div className="post-list">
              {trail.map((style, index) => {
                const post = filteredPosts[index];
                return (
                  <animated.div key={post.postId} style={style} className="post-item">
                    <Link to={`/post/${post.slug}`} className="post-link">
                    <div className="post-title-container">
                    <img
                      src={post.titleImage || fallbackImage}
                      alt={`${post.title} thumbnail`}
                      className="post-image"
                      loading="lazy"
                    />
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                    </Link>
                    
                  </animated.div>
                );
              })}
            </div>
          )}
          <button className="chat-toggle-btn" onClick={openNewChat}>
            Open AI Help
          </button>
          {chatWindows.map((chat) => (
            <ChatWindow
              key={chat.id}
              id={chat.id}
              category={category}
              filteredPosts={filteredPosts}
              onClose={() => closeChat(chat.id)}
              initialPosition={chat.position}
            />
          ))}
        </animated.div>
  );
};

export default CategoryPage;
