import { Form, ActionPanel, Action, showToast, LocalStorage, Toast } from "@raycast/api";
import got from "got";
import { useState } from "react";

type Values = {
  access_code: string;
};

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: Values) {
    setIsLoading(true);

    const jwtToken = await LocalStorage.getItem("jwt_token");

    if (! jwtToken) {
        showToast({ 
            title: "Storage Error", 
            message: "Failed to load JWT token from storage",
            style: Toast.Style.Failure 
        });
        setIsLoading(false);
    }

    try {
      await got.post("https://api-starter.test/workspaces/join", {
        json: values,
        responseType: 'json',
        headers: {
            Authorization: `Bearer ${jwtToken}`
        },
        https: {
          rejectUnauthorized: false
        }
      });

      showToast({ 
        title: "Joined Workspace", 
        message: "Workspace joined successfully",
        style: Toast.Style.Success 
      });
    } catch (error) {
      showToast({ 
        title: "Failed to join Workspace", 
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
      <Form.Description text="Join a workspace using an Access Code." />
      <Form.TextField id="access_code" title="Access Code" placeholder="super-secret-access-code" />
    </Form>
  );
}