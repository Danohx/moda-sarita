import '@shared/index.css'
import { AuthProvider } from '@shared/context/AuthProvider'
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;