import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

def send_email(recipient_email: str, subject: str, body: str, attachment_path: str = None):
    """Send an email with an optional attachment."""
    sender_email = "Kantara@hr.com"  # Replace with your email (not used in MailHog)
    # sender_password = ""  # No password needed for MailHog

    # Create the email message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject

    # Attach the email body
    msg.attach(MIMEText(body, 'plain'))

    # Attach the file if provided
    if attachment_path:
        with open(attachment_path, "rb") as attachment:
            part = MIMEApplication(attachment.read(), Name=attachment_path)
            part['Content-Disposition'] = f'attachment; filename="{attachment_path}"'
            msg.attach(part)

    # Send the email
    try:
        with smtplib.SMTP('mailhog', 1025) as server:  # Use MailHog's SMTP server via Docker Compose service name
            server.send_message(msg)
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Example usage
if __name__ == "__main__":
    send_email(
        recipient_email="AbhinavKamikaze@abc.com",  # Replace with recipient's email
        subject="Test Email",
        body="This is a test email with an attachment.",
        # attachment_path="path/to/your/file.txt"  # Optional attachment
    )