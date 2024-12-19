import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";

type CheckInFormProps = {
  workspaceName: string;
};

export default function CheckInForm({ workspaceName }: CheckInFormProps) {
  const handleSubmit = (values: { checkIn: string }) => {
    showToast({
      title: "Check-In Submitted",
      message: `Workspace: ${workspaceName}, Check-In: ${values.checkIn}`,
      style: Toast.Style.Success,
    });
  };

  return (
    <Form
      navigationTitle={`Daily Check-In - ${workspaceName}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Check-In" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="checkIn" title="Check-In" placeholder="What did you do today?" />
    </Form>
  );
}