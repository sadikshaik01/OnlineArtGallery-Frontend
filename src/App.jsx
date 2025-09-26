import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// --- Reusable Helper Components ---
const NavLink = ({ children, onClick, isActive }) => (
  <button onClick={onClick} className={`nav-link ${isActive ? 'active' : ''}`}>
    {children}
  </button>
);

const Modal = ({ children, onClose }) => (
  <div className="modal-overlay animate-fade-in" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const Toast = ({ message, type }) => {
  const typeClass = type === 'success' ? 'toast-success' : 'toast-info';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
  return (
    <div className={`toast ${typeClass} animate-fade-in-up`}>
      <i className={`fas ${icon}`} style={{ marginRight: '0.75rem' }}></i>
      <span>{message}</span>
    </div>
  );
};

const ToastContainer = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(toast => (
      <Toast key={toast.id} message={toast.message} type={toast.type} />
    ))}
  </div>
);

const ArtCardSkeleton = () => (
  <div className="skeleton-card animate-pulse">
    <div className="image"></div>
    <div className="p-5">
      <div className="text-line w-3/4 mb-2"></div>
      <div className="text-line-short w-1/2 mb-4"></div>
      <div className="art-card-footer">
        <div className="button-placeholder w-1/3"></div>
        <div className="button-placeholder rounded-full w-1/3"></div>
      </div>
    </div>
  </div>
);


// --- Main Components ---

const Header = ({ onNavigate, onSetModalView, onLogout, page, cart, favorites, currentUser }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleMobileNav = (pageName) => {
    onNavigate(pageName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="header-nav container">
        <button onClick={() => onNavigate('home')} className="header-logo">Artisan</button>
        <div className="header-nav-links">
          <NavLink onClick={() => onNavigate('gallery')} isActive={page === 'gallery'}>Gallery</NavLink>
          <NavLink onClick={() => onNavigate('artists')} isActive={page === 'artists'}>Artists</NavLink>
          <NavLink onClick={() => onNavigate('exhibitions')} isActive={page === 'exhibitions'}>Exhibitions</NavLink>
        </div>
        <div className="header-icons">
          {currentUser && (
            <button onClick={() => onNavigate('favorites')} className="header-icon">
              <i className="fas fa-heart"></i>
              {favorites.length > 0 && <span className="header-icon-badge">{favorites.length}</span>}
            </button>
          )}
          <button onClick={() => onNavigate('cart')} className="header-icon">
            <i className="fas fa-shopping-bag"></i>
            {cartItemCount > 0 && <span className="header-icon-badge header-icon-bag-badge">{cartItemCount}</span>}
          </button>
          <div className="header-nav-links">
            {currentUser ? (
              <>
                <NavLink onClick={() => onNavigate('upload')}>Upload</NavLink>
                <button onClick={onLogout} className="button button-secondary">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => onSetModalView('login')} className="nav-link">Login</button>
                <button onClick={() => onSetModalView('signup')} className="button button-primary">Sign Up</button>
              </>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="mobile-menu-button">
            <i className={isMobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => handleMobileNav('gallery')} className="mobile-menu-link">Gallery</button>
          <button onClick={() => handleMobileNav('artists')} className="mobile-menu-link">Artists</button>
          <button onClick={() => handleMobileNav('exhibitions')} className="mobile-menu-link">Exhibitions</button>
          <div className="border-t my-2"></div>
          {currentUser ? (
            <>
              <button onClick={() => handleMobileNav('upload')} className="mobile-menu-link">Upload Artwork</button>
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="mobile-menu-login">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { onSetModalView('login'); setMobileMenuOpen(false); }} className="mobile-menu-login">Login</button>
              <button onClick={() => { onSetModalView('signup'); setMobileMenuOpen(false); }} className="mobile-menu-signup">Sign Up</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const ArtCard = ({ art, onViewDetails, onAddToCart, onNavigateToArtist, onToggleFavorite, isFavorite, currentUser, artists }) => (
  <div className="art-card">
    <div className="art-card-image-container">
      <div className="cursor-pointer" onClick={() => onViewDetails(art)}>
        <img src={art.image} alt={art.title} className="art-card-image" />
        <div className="art-card-overlay"></div>
      </div>
      {currentUser && (
        <button onClick={() => onToggleFavorite(art.id)} className="art-card-favorite-button">
          <i className={`${isFavorite ? 'fas art-card-favorite-icon-filled' : 'far'} fa-heart`}></i>
        </button>
      )}
      {art.type === 'auction' && (
        <div className="art-card-auction-badge">AUCTION</div>
      )}
    </div>
    <div className="art-card-content">
      <h3 className="art-card-title">{art.title}</h3>
      <button onClick={e => { e.stopPropagation(); onNavigateToArtist(art.artistId); }} className="art-card-artist">
        by {artists.find(a => a.id === art.artistId)?.name || 'Unknown Artist'}
      </button>
      <div className="art-card-footer">
        <p className="art-card-price">
          {art.type === 'auction' ? `Start: $${art.price.toLocaleString()}` : `$${art.price.toLocaleString()}`}
        </p>
        <button onClick={() => onAddToCart(art)} className="art-card-button">
          {art.type === 'auction' ? 'Place Bid' : 'Add to Bag'}
        </button>
      </div>
    </div>
  </div>
);

// --- Page Components ---

const HomePage = ({ artworks, onNavigate, onViewDetails, onAddToCart, onNavigateToArtist, onToggleFavorite, favorites, currentUser, artists }) => (
  <>
    <section className="home-hero">
      <div>
        <h1 className="home-hero-title animate-fade-in-down">A Canvas for the World's Creativity</h1>
        <p className="home-hero-subtitle animate-fade-in-up">Discover, collect, and sell extraordinary artwork from talented artists globally.</p>
        <button onClick={() => onNavigate('gallery')} className="button button-primary" style={{ marginTop: '2rem' }}>
          Explore Gallery
        </button>
      </div>
    </section>
    <section className="home-featured">
      <div className="container">
        <h2 className="home-featured-title">Featured Artwork</h2>
        <div className="home-art-grid">
          {artworks.slice(0, 6).map(art => (
            <ArtCard key={art.id} art={art} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onNavigateToArtist={onNavigateToArtist} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(fav => fav.id === art.id)} currentUser={currentUser} artists={artists} />
          ))}
        </div>
      </div>
    </section>
  </>
);

const GalleryPage = ({ artworks, onViewDetails, onAddToCart, onNavigateToArtist, onToggleFavorite, favorites, currentUser, artists }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 750);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', ...new Set(artworks.map(art => art.category))];
  const filteredArtworks = activeCategory === 'All' ? artworks : artworks.filter(art => art.category === activeCategory);

  return (
    <div className="container gallery-page">
      <h1 className="gallery-title">Gallery</h1>
      <div className="gallery-categories">
        {categories.map(category => (
          <button key={category} onClick={() => setActiveCategory(category)} className={`gallery-category-button ${activeCategory === category ? 'active' : ''}`}>
            {category}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <ArtCardSkeleton key={index} />)
          : filteredArtworks.map(art => <ArtCard key={art.id} art={art} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onNavigateToArtist={onNavigateToArtist} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(fav => fav.id === art.id)} currentUser={currentUser} artists={artists} />)
        }
      </div>
    </div>
  );
};

const ArtistListPage = ({ artists, onNavigateToArtist }) => (
  <div className="container artists-page">
    <h1 className="artists-title">Our Artists</h1>
    <div className="artists-grid">
      {artists.map(artist => (
        <div key={artist.id} onClick={() => onNavigateToArtist(artist.id)} className="artist-card">
          <img src={artist.profileImage} alt={artist.name} className="artist-profile-image" />
          <h3 className="artist-name">{artist.name}</h3>
        </div>
      ))}
    </div>
  </div>
);

const ArtistProfilePage = ({ artist, artworks, onViewDetails, onAddToCart, onBack, onNavigateToArtist, onToggleFavorite, favorites, currentUser, artists }) => {
  const artistArtworks = artworks.filter(art => art.artistId === artist.id);
  // Show reviews from all the artist's artworks
  const artistReviews = artistArtworks
    .flatMap(art => art.reviews.map(r => ({ ...r, artTitle: art.title })))
    .slice(0, 4);

  return (
    <div className="container artist-profile-page">
      <button onClick={onBack} className="back-button">&larr; Back to Artists</button>
      <div className="artist-profile-header">
        <img src={artist.profileImage} alt={artist.name} />
        <div className="artist-profile-header-content">
          <h1>{artist.name}</h1>
          <p>{artist.bio}</p>
          <div className="artist-profile-reviews">
            <h3>Recent Reviews</h3>
            {artistReviews.length === 0 ? (
              <span>No reviews yet.</span>
            ) : artistReviews.map(r => (
              <div key={r.id} style={{ marginBottom: 8 }}>
                <b>{r.user}</b>: <span>{r.comment}</span>
                <i style={{ marginLeft: 6, color: "#888" }}>({r.artTitle})</i>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h2 className="artist-art-title">Artwork by {artist.name}</h2>
      <div className="artist-art-grid">
        {artistArtworks.map(art => (
          <ArtCard key={art.id} art={art} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onNavigateToArtist={onNavigateToArtist} onToggleFavorite={onToggleFavorite} isFavorite={favorites.some(fav => fav.id === art.id)} currentUser={currentUser} artists={artists} />
        ))}
      </div>
    </div>
  );
};

const ExhibitionsPage = ({ exhibitions }) => (
  <div className="container exhibitions-page">
    <h1 className="exhibitions-title">Exhibitions</h1>
    <div className="exhibitions-list">
      {exhibitions.map(exhibition => (
        <div key={exhibition.id} className="exhibition-card">
          <img src={exhibition.image} alt={exhibition.title} className="exhibition-image" />
          <div className="exhibition-content">
            <h2 className="exhibition-title">{exhibition.title}</h2>
            <p className="exhibition-date">{exhibition.date}</p>
            <p className="exhibition-description">{exhibition.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ArtworkDetailPage = ({ art, onAddToCart, onBack, onNavigateToArtist, onPostReview, currentUser, onToggleFavorite, isFavorite, artists }) => {
  const [reviewText, setReviewText] = useState('');
  const artistName = artists.find(a => a.id === art.artistId)?.name || 'Unknown Artist';

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewText.trim()) {
      onPostReview(art.id, reviewText);
      setReviewText('');
    }
  };

  return (
    <div className="container detail-page animate-fade-in">
      <button onClick={onBack} className="detail-back-button">
        &larr; Back to Gallery
      </button>
      <div className="detail-grid">
        <div className="detail-image-container">
          <img src={art.image} alt={art.title} className="detail-image" />
          {currentUser && (
            <button onClick={() => onToggleFavorite(art.id)} className="detail-favorite-button">
              <i className={`${isFavorite ? 'fas detail-favorite-icon-filled' : 'far'} fa-heart`}></i>
            </button>
          )}
        </div>
        <div>
          <h1 className="detail-title">{art.title}</h1>
          <button onClick={() => onNavigateToArtist(art.artistId)} className="detail-artist-link">by {artistName}</button>
          <p className="detail-price">
            {art.type === 'auction' ? `Starting Bid: $${art.price.toLocaleString()}` : `$${art.price.toLocaleString()}`}
          </p>
          <button onClick={() => onAddToCart(art)} className="detail-add-to-cart-button">
            <i className={`fas ${art.type === 'auction' ? 'fa-gavel' : 'fa-shopping-bag'}`} style={{ marginRight: '0.5rem' }}></i>
            {art.type === 'auction' ? 'Place Your Bid' : 'Add to Bag'}
          </button>
          <div className="detail-info">
            <p>{art.description}</p>
            <div>
              <h3>Details:</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
                <li>Category: {art.category}</li>
                <li>Medium: {art.medium}</li>
                <li>Dimensions: {art.dimensions}</li>
              </ul>
            </div>
          </div>
          <div className="detail-reviews">
            <h3>Reviews</h3>
            {art.reviews.length > 0 ? (
              <div className="detail-review-list">
                {art.reviews.map(review => (
                  <div key={review.id} className="detail-review-item">
                    <p style={{ fontWeight: '600' }}>{review.user}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#6b7280' }}>No reviews yet.</p>}

            {currentUser && (
              <form onSubmit={handleReviewSubmit} className="detail-review-form">
                <h4>Leave a Review</h4>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows="3"
                  placeholder="Share your thoughts..."
                ></textarea>
                <button type="submit">Post Review</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- MODIFIED CartPage -----
const CartPage = ({ cart, onUpdateCart, onNavigate, artists }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Your Bag</h1>
      {cart.length === 0 ? (
        <div className="empty-cart-message">
          <p>Your bag is empty.</p>
          <button onClick={() => onNavigate('gallery')} className="button button-primary" style={{ marginTop: '1.5rem' }}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item-card">
                <img src={item.image} alt={item.title} className="cart-item-image" />
                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p>{artists.find(a => a.id === item.artistId)?.name}</p>
                  <p className="cart-item-price">${item.price.toLocaleString()}</p>
                </div>
                <div className="cart-item-controls">
                  <input type="number" value={item.quantity} 
                    onChange={e => onUpdateCart(item.id, parseInt(e.target.value))}
                    className="cart-item-quantity" min="1" />
                  <button onClick={() => onUpdateCart(item.id, 0)} 
                    className="cart-item-remove-button" style={{ marginLeft: '8px' }}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="cart-summary-line" style={{ color: '#6b7280' }}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="cart-summary-line cart-summary-total">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <button onClick={() => onNavigate('checkout')} className="cart-checkout-button">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage = ({ onBack, onPayment }) => {
  const [form, setForm] = useState({
    fullName: '', email: '', address: '', city: '', zip: '', card: '', name: '', expiry: '', cvc: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onPayment();
  };

  return (
    <div className="container checkout-page">
      <button onClick={onBack} className="back-button">&larr; Back to Bag</button>
      <h1 className="checkout-title">Checkout</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <input name="fullName" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="form-input" required />
        <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="form-input" required />
        <input name="address" type="text" placeholder="Address" value={form.address} onChange={handleChange} className="form-input" required />
        <input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} className="form-input" required />
        <input name="zip" type="text" placeholder="ZIP Code" value={form.zip} onChange={handleChange} className="form-input" required />
        <input name="card" type="text" placeholder="Card Number" value={form.card} onChange={handleChange} className="form-input" required />
        <input name="name" type="text" placeholder="Cardholder Name" value={form.name} onChange={handleChange} className="form-input" required />
        <div className="form-input-grid">
          <input name="expiry" type="text" placeholder="MM/YY" value={form.expiry} onChange={handleChange} className="form-input" required />
          <input name="cvc" type="text" placeholder="CVC" value={form.cvc} onChange={handleChange} className="form-input" required />
        </div>
        <button type="submit" className="checkout-submit-button">Pay Now</button>
      </form>
    </div>
  );
};

const UploadArtworkPage = ({ onBack, onArtworkSubmit, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Abstract');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please upload an image for the artwork.");
      return;
    }
    const newArtwork = {
      id: Date.now(),
      title,
      artist: currentUser.name,
      artistId: currentUser.id,
      price: parseInt(price),
      image: URL.createObjectURL(imageFile),
      description,
      medium: 'Oil on Canvas',
      dimensions: '24" x 36"',
      category,
      type: listingType,
      reviews: [],
    };
    onArtworkSubmit(newArtwork);
  };

  return (
    <div className="container upload-page">
      <button onClick={onBack} className="back-button">&larr; Back to Dashboard</button>
      <h1 className="upload-title">Upload New Artwork</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Artwork Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Abstract</option>
            <option>Landscape</option>
            <option>Portrait</option>
            <option>Still Life</option>
            <option>Digital</option>
          </select>
        </div>
        <div className="upload-form-grid">
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" placeholder="e.g., 1200" value={price} onChange={e => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Listing Type</label>
            <select value={listingType} onChange={e => setListingType(e.target.value)}>
              <option value="sale">For Sale</option>
              <option value="auction">Auction</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Upload Image</label>
          <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" required />
        </div>
        <button type="submit" className="upload-submit-button">Submit Artwork</button>
      </form>
    </div>
  );
};

const FavoritesPage = ({ favorites, onNavigate, onViewDetails, onAddToCart, onNavigateToArtist, onToggleFavorite, currentUser, artists }) => (
  <div className="container favorites-page">
    <h1 className="favorites-title">Your Favorites</h1>
    {favorites.length === 0 ? (
      <div className="empty-favorites-message">
        <p>You haven't favorited any artwork yet.</p>
        <button onClick={() => onNavigate('gallery')} className="button button-primary" style={{ marginTop: '1.5rem' }}>
          Explore Gallery
        </button>
      </div>
    ) : (
      <div className="gallery-grid">
        {favorites.map(art => (
          <ArtCard key={art.id} art={art} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onNavigateToArtist={onNavigateToArtist} onToggleFavorite={onToggleFavorite} isFavorite={true} currentUser={currentUser} artists={artists} />
        ))}
      </div>
    )}
  </div>
);

// --- Auth Components ---
const LoginContent = ({ onClose, onSwitch, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    onLogin({ email, password });
  };
  return (
    <>
      <h2 className="auth-modal-title">Welcome Back</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="auth-submit-button">Login</button>
      </form>
      <p className="auth-switch-text">
        Don't have an account? <button onClick={onSwitch} className="auth-switch-button">Sign Up</button>
      </p>
    </>
  );
};

const SignUpContent = ({ onClose, onSwitch, onSignUp }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const handleSubmit = (e) => {
    e.preventDefault();
    onSignUp({ fullName, email, password, role });
  };
  return (
    <>
      <h2 className="auth-modal-title">Create Your Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <div style={{ display: 'flex', margin: '1rem 0', border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '0.25rem' }}>
          <button type="button" onClick={() => setRole('BUYER')} style={{ flex: 1, padding: '0.5rem', borderRadius: '9999px', border: 'none', background: role === 'BUYER' ? 'var(--primary-color)' : 'transparent', color: role === 'BUYER' ? 'white' : 'var(--text-color)' }}>I'm a Collector</button>
          <button type="button" onClick={() => setRole('ARTIST')} style={{ flex: 1, padding: '0.5rem', borderRadius: '9999px', border: 'none', background: role === 'ARTIST' ? 'var(--primary-color)' : 'transparent', color: role === 'ARTIST' ? 'white' : 'var(--text-color)' }}>I'm an Artist</button>
        </div>
        <button type="submit" className="auth-submit-button">Create Account</button>
      </form>
      <p className="auth-switch-text">
        Already have an account? <button onClick={onSwitch} className="auth-switch-button">Login</button>
      </p>
    </>
  );
};


// --- Main Application Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [selectedArt, setSelectedArt] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [modalView, setModalView] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const API_URL = 'http://localhost:8082/api/auth';

  const [artists, setArtists] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const initialArtists = [
      { id: 1, name: 'Elena Petrova', profileImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop', bio: 'An abstract artist from St. Petersburg.' },
      { id: 2, name: 'Marcus Reid', profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop', bio: 'Based in Vancouver, Marcus is a contemporary painter specializing in vibrant landscapes.' },
      { id: 3, name: 'Priya Sen', profileImage: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?q=80&w=1974&auto=format&fit=crop', bio: 'Priya creates vivid digital art inspired by Indian folklore.' },
      { id: 4, name: 'Leo Andersen', profileImage: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1974&auto=format&fit=crop', bio: 'A Danish artist known for minimalistic portraiture and sculpture.' },
      { id: 5, name: 'Maya Yoon', profileImage: 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?q=80&w=1974&auto=format&fit=crop', bio: 'Maya specializes in modern still life and digital compositions.' }
    ];

    const initialArtworks = [
      { id: 1, artistId: 1, title: 'Crimson Dusk', price: 1200, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop', description: 'An abstract representation of a fiery sunset.', medium: 'Oil on Canvas', dimensions: '24" x 36"', category: 'Abstract', type: 'sale', reviews: [{ id: 1, user: 'ArtLover22', comment: 'Absolutely stunning in person!' }] },
      { id: 2, artistId: 2, title: "Ocean's Whisper", price: 2500, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', description: 'A textured piece capturing the powerful yet gentle nature.', medium: 'Acrylic', dimensions: '48" x 48"', category: 'Landscape', type: 'sale', reviews: [] },
      { id: 3, artistId: 3, title: 'Mythic Lotus', price: 1500, image: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?q=80&w=1974&auto=format&fit=crop', description: 'A vibrant digital piece inspired by Indian mythology.', medium: 'Digital', dimensions: '30" x 30"', category: 'Digital', type: 'auction', reviews: [{ id: 2, user: 'PriyaFan', comment: 'Colorful and imaginative!' }] },
      { id: 4, artistId: 2, title: 'Gold Mist', price: 2200, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1974&auto=format&fit=crop', description: 'Earthy tones meeting crisp light.', medium: 'Acrylic', dimensions: '36" x 48"', category: 'Landscape', type: 'sale', reviews: [{ id: 3, user: 'NatureAppreciator', comment: 'Feels serene!' }] },
      { id: 5, artistId: 5, title: 'Still Serenity', price: 900, image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1374&auto=format&fit=crop', description: 'Modern interpretation of still life.', medium: 'Digital', dimensions: '16" x 20"', category: 'Still Life', type: 'sale', reviews: [] },
      { id: 6, artistId: 4, title: 'Emergent', price: 1700, image: 'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?q=80&w=1974&auto=format&fit=crop', description: 'A minimalist portrait series.', medium: 'Oil on Canvas', dimensions: '20" x 30"', category: 'Portrait', type: 'sale', reviews: [] },
      { id: 7, artistId: 4, title: 'The Thinker', price: 3400, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1974&auto=format&fit=crop', description: 'A sculpture study of human form.', medium: 'Sculpture', dimensions: '32cm x 10cm x 10cm', category: 'Abstract', type: 'auction', reviews: [{ id: 4, user: 'SculptFan', comment: 'Very modern.' }] },
      { id: 8, artistId: 3, title: 'Peacock Dream', price: 1150, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1974&auto=format&fit=crop', description: 'Glorious colors in a contemporary style.', medium: 'Digital', dimensions: '20" x 20"', category: 'Digital', type: 'sale', reviews: [] },
      { id: 9, artistId: 5, title: 'Chroma Still', price: 950, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1974&auto=format&fit=crop', description: 'Still life in bursting neon hues.', medium: 'Digital', dimensions: '22" x 30"', category: 'Still Life', type: 'sale', reviews: [{ id: 5, user: 'MellowMuse', comment: 'Lovely colors.' }] },
    ];

    setArtists(initialArtists);
    setArtworks(initialArtworks);
    setExhibitions([
      { id: 1, title: 'Horizons: A Study of Light', date: 'October 15 - November 30, 2024', description: 'Explore light and landscape through contemporary works.', image: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2070&auto=format&fit=crop' },
      { id: 2, title: 'Digital Renaissance', date: 'January 1 - February 20, 2025', description: 'Celebrating global digital artistry in the modern age.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop' },
      { id: 3, title: 'Minimalist Forms', date: 'March 10 - April 15, 2025', description: 'An international show of minimalism in painting and sculpture.', image: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?q=80&w=1974&auto=format&fit=crop' }
    ]);

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setCurrentUser({ name: decoded.sub, role: 'ARTIST', id: 1 }); // Mock
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 4000);
  };

  const navigate = (pageName) => {
    setPage(pageName);
    window.scrollTo(0, 0);
  };

  const handleSignUp = async (userData) => {
    try {
      await axios.post(`${API_URL}/signup`, userData);
      addToast('Sign up successful! Please log in.', 'success');
      setModalView('login');
    } catch (error) {
      addToast(error.response?.data?.message || 'Sign up failed. Please try again.', 'error');
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded = parseJwt(token);
      const userRole = 'ARTIST'; // Mock
      const user = artists.find(a => a.name === "Elena Petrova") || artists[0];
      setCurrentUser({ name: decoded.sub, role: userRole, id: user.id });
      setModalView(null);
      navigate(userRole === 'ARTIST' ? 'artistDashboard' : 'buyerDashboard');
      addToast('Login Successful!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Invalid email or password.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    navigate('home');
    addToast('You have been logged out.');
  };

  const handleAddToCart = (art) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === art.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === art.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...art, quantity: 1 }];
    });
    addToast(`${art.title} added to your bag!`, 'success');
  };

  const handleUpdateCart = (artId, quantity) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== artId);
      }
      return prevCart.map(item =>
        item.id === artId ? { ...item, quantity } : item
      );
    });
  };

  const handlePayment = () => {
    setCart([]);
    addToast("Payment successful! Thank you for your purchase.", "success");
    navigate('home');
  };

  const viewDetails = (art) => {
    setSelectedArt(art);
    setPage('details');
  };

  const handleNavigateToArtist = (artistId) => {
    setSelectedArtist(artists.find(a => a.id === artistId));
    setPage('artistProfile');
  };

  const toggleFavorite = (artId) => {
    setFavorites(favs =>
      favs.some(a => a.id === artId)
        ? favs.filter(a => a.id !== artId)
        : [...favs, artworks.find(a => a.id === artId)]
    );
  };

  const handlePostReview = (artId, comment) => {
    setArtworks(arts =>
      arts.map(art =>
        art.id === artId
          ? { ...art, reviews: [...art.reviews, { id: Date.now(), user: currentUser?.name || "Anonymous", comment }] }
          : art
      )
    );
    addToast("Review posted!", "success");
  };

  const handleArtworkSubmit = (newArtwork) => {
    setArtworks(prevArts => [newArtwork, ...prevArts]);
    addToast("Artwork uploaded!", "success");
    navigate('gallery');
  };

  const renderPage = () => {
    if (page === 'details' && selectedArt) {
      return <ArtworkDetailPage art={selectedArt} onAddToCart={handleAddToCart} onBack={() => navigate('gallery')} onNavigateToArtist={handleNavigateToArtist} onPostReview={handlePostReview} currentUser={currentUser} onToggleFavorite={toggleFavorite} isFavorite={favorites.some(fav => fav.id === selectedArt.id)} artists={artists} />;
    }
    if (page === 'artistProfile' && selectedArtist) {
      return <ArtistProfilePage artist={selectedArtist} artworks={artworks} onViewDetails={viewDetails} onAddToCart={handleAddToCart} onBack={() => navigate('artists')} onNavigateToArtist={handleNavigateToArtist} onToggleFavorite={toggleFavorite} favorites={favorites} currentUser={currentUser} artists={artists} />;
    }
    switch (page) {
      case 'gallery':
        return <GalleryPage artworks={artworks} onViewDetails={viewDetails} onAddToCart={handleAddToCart} onNavigateToArtist={handleNavigateToArtist} onToggleFavorite={toggleFavorite} favorites={favorites} currentUser={currentUser} artists={artists} />;
      case 'artists':
        return <ArtistListPage artists={artists} onNavigateToArtist={handleNavigateToArtist} />;
      case 'exhibitions':
        return <ExhibitionsPage exhibitions={exhibitions} />;
      case 'cart':
        return <CartPage cart={cart} onUpdateCart={handleUpdateCart} onNavigate={navigate} artists={artists} />;
      case 'checkout':
        return <CheckoutPage onBack={() => navigate('cart')} onPayment={handlePayment} />;
      case 'upload':
        return <UploadArtworkPage onBack={() => navigate('home')} onArtworkSubmit={handleArtworkSubmit} currentUser={currentUser} />;
      case 'favorites':
        return <FavoritesPage favorites={favorites} onNavigate={navigate} onViewDetails={viewDetails} onAddToCart={handleAddToCart} onNavigateToArtist={handleNavigateToArtist} onToggleFavorite={toggleFavorite} currentUser={currentUser} artists={artists} />;
      case 'home':
      default:
        return <HomePage artworks={artworks} onNavigate={navigate} onViewDetails={viewDetails} onAddToCart={handleAddToCart} onNavigateToArtist={handleNavigateToArtist} onToggleFavorite={toggleFavorite} favorites={favorites} currentUser={currentUser} artists={artists} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        onNavigate={navigate}
        onSetModalView={setModalView}
        onLogout={handleLogout}
        page={page}
        cart={cart}
        favorites={favorites}
        currentUser={currentUser}
      />

      <main>
        {renderPage()}
      </main>

      {modalView && (
        <Modal onClose={() => setModalView(null)}>
          {modalView === 'login' && <LoginContent onSwitch={() => setModalView('signup')} onLogin={handleLogin} />}
          {modalView === 'signup' && <SignUpContent onSwitch={() => setModalView('login')} onSignUp={handleSignUp} />}
        </Modal>
      )}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Artisan Gallery. All rights reserved.</p>
        </div>
      </footer>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
