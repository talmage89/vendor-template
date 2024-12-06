# Vendor Template

Template for ecommerce app.

## Tech Stack

Backend:

- Django
- Django REST Framework
- PostgreSQL
- Docker

Frontend:

- React
- Vite

Integrations:

- Stripe
- Mailgun
- Shippo

## Development

For development, the backend needs a `.env` file structured like so:

```
# ./backend/.env
PRODUCTION=false
FRONTEND_URL=http://localhost:5173

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
TESTING_RECIPIENT=

POSTGRES_DB=vendor_template_backend
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

If you don't use Docker, make sure to set up a Postgres database and fill in the credentials.
Make sure to also set up the Mailgun account and fill in the credentials. The testing recipient email address is where every email will be sent while `DEBUG=true`. Emails will fail silently so make sure to check the Mailgun dashboard.

The frontend `.env` just needs the API URL:

```
# ./frontend/.env
VITE_API_URL=http://localhost:8000
```
