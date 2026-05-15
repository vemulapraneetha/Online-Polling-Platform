import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/feed">
          <Button>Go to Feed</Button>
        </Link>
      </div>
    </div>
  );
}
