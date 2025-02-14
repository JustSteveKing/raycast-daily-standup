import { Form, ActionPanel, Action, showToast, LocalStorage, Toast } from "@raycast/api";
import got from "got";
import { useState } from "react";

type Values = {
  email: string;
  password: string;
};

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: Values) {
    setIsLoading(true);

    try {
      const response = await got.post("https://api-starter.test/auth/login", {
        json: values,
        responseType: 'json',
        // For self-signed certificates in development
        https: {
          rejectUnauthorized: false
        }
      });

      const token = response.body.access_token;
      const streamToken = response.body.stream_token;

      await LocalStorage.setItem("jwt_token", token);
      await LocalStorage.setItem("stream_token", streamToken);

      showToast({ 
        title: "Login Successful", 
        message: "JWT token stored",
        style: Toast.Style.Success 
      });
    } catch (error) {
      showToast({ 
        title: "Failed to login", 
        message: error instanceof Error ? error.message : "Unknown error", 
        style: Toast.Style.Failure 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.Description text="Sign into your account to get started." />
      <Form.TextField id="email" title="Email Address" placeholder="jon.snow@thewall.io" />
      <Form.PasswordField id="password" title="Password" placeholder="super-secret-password" />
    </Form>
  );
}