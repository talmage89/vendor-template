import './Error.scss';

type ErrorProps = {
  error: Error;
};

export const Error = (props: ErrorProps) => {
  return (
    <div className="Error">
      <h2>An error occurred.</h2>
      <p>{props.error.message}</p>
      <p>Please try again later.</p>
    </div>
  );
};
