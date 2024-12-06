import requests
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


class EmailManager:
    @staticmethod
    def send_template_email(
        template_name, context, subject, recipient_list, from_email=None
    ):
        try:
            html_content = render_to_string(f"emails/{template_name}.html", context)
            text_content = strip_tags(html_content)

            response = requests.post(
                f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
                auth=("api", settings.MAILGUN_API_KEY),
                data={
                    "from": from_email or settings.DEFAULT_FROM_EMAIL,
                    "to": (
                        settings.TESTING_RECIPIENT if settings.DEBUG else recipient_list
                    ),
                    "subject": subject,
                    "text": text_content,
                    "html": html_content,
                },
            )

            if response.status_code != 200:
                raise Exception(f"Failed to send email: {response.text}")

            return response.ok

        except requests.RequestException as e:
            raise Exception(f"Email request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to send email: {str(e)}")

    @classmethod
    def send_verification_email(cls, user):
        try:
            context = {
                "user": user,
                "verification_url": f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}",
            }

            return cls.send_template_email(
                template_name="verify_email",
                context=context,
                subject="Verify your email address",
                recipient_list=[user.email],
            )
        except Exception as e:
            # raise Exception(f"Failed to send verification email: {str(e)}")
            return False

    @classmethod
    def send_password_reset_email(cls, user):
        try:
            context = {
                "user": user,
                "reset_url": f"{settings.FRONTEND_URL}/reset-password?token={user.password_reset_token}",
            }

            return cls.send_template_email(
                template_name="password_reset",
                context=context,
                subject="Reset your password",
                recipient_list=[user.email],
            )
        except Exception as e:
            # raise Exception(f"Failed to send password reset email: {str(e)}")
            return False

    @classmethod
    def send_account_exists_email(cls, user):
        try:
            context = {
                "user": user,
                "login_url": f"{settings.FRONTEND_URL}/login",
                "reset_password_url": f"{settings.FRONTEND_URL}/reset-password?token={user.password_reset_token}",
            }

            return cls.send_template_email(
                template_name="account_exists",
                context=context,
                subject="Account Already Exists",
                recipient_list=[user.email],
            )
        except Exception as e:
            # raise Exception(f"Failed to send account exists email: {str(e)}")
            return False
