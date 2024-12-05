import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Error } from '../../components';

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return <Error error={error as Error} />;
}
