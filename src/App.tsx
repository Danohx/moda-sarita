// src/App.jsx
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;