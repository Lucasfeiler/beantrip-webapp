import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopsProvider } from './context/ShopsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { VisitsProvider } from './context/VisitsContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ShopDetail from './pages/ShopDetail';
import MapPage from './pages/MapPage';
import NearMe from './pages/NearMe';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AddShop from './pages/AddShop';
import Admin from './pages/Admin';
import MyShop from './pages/MyShop';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import News from './pages/News';
import Article from './pages/Article';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Passport from './pages/Passport';
import Gear from './pages/Gear';
import Feedback from './pages/Feedback';
import SplashScreen from './components/SplashScreen';
import { Privacy, Terms, Impressum } from './pages/StaticPages';

export default function App() {
  return (
    <LanguageProvider>
      <SplashScreen />
      <AuthProvider>
        <ShopsProvider>
          <FavoritesProvider>
            <VisitsProvider>
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/explore/:citySlug" element={<Explore />} />
                    <Route path="/shop/:slug" element={<ShopDetail />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/near-me" element={<NearMe />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/add-shop" element={<AddShop />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/my-shop" element={<MyShop />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:slug" element={<Article />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:slug" element={<EventDetail />} />
                    <Route path="/passport" element={<Passport />} />
                    <Route path="/gear" element={<Gear />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/impressum" element={<Impressum />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </VisitsProvider>
          </FavoritesProvider>
        </ShopsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
