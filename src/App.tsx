import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

// TODO 5.3 (Errores): agregue la ruta comodín path="*" que muestre NotFoundPage.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/recetas" element={<RecipesPage />} />
        <Route path="/recetas/:id" element={<RecipeDetailPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/recetas" replace />} />
    </Routes>
  )
}

export default App
