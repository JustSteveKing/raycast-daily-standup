import { List, ActionPanel, Action, showToast, Toast, LocalStorage, Form } from "@raycast/api";
import { useEffect, useState } from "react";
import got from "got";
import stream from "getstream"

type User = {
    id: string;
    name: string;
    email: string;
    memberships: Membership[];
};

type Membership = {
    id: string;
    role: string;
    workspace: Workspace;
};

type Workspace = {
    id: string;
    name: string;
};

export default function Command() {
    const [user, setUser] = useState<User>();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkspaces() {
            try {
                const data = await got("https://api-starter.test/auth/me", {
                    headers: {
                        Authorization: `Bearer ${await LocalStorage.getItem("jwt_token")}`,
                    },
                    https: {
                        rejectUnauthorized: false
                    }
                }).json();

                setUser(data.user);
                setWorkspaces(data.user.memberships.map((membership: any) => membership.workspace));
            } catch (error) {
                showToast({
                    title: "Failed to fetch workspaces",
                    message: error instanceof Error ? error.message : "Unknown error",
                    style: Toast.Style.Failure,
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchWorkspaces();
    }, []);

    return (
        <List isLoading={isLoading}>
            {workspaces.map((workspace) => (
                <List.Item
                    key={workspace.id}
                    title={workspace.name}
                    actions={
                        <ActionPanel>
                            <Action.Push title="Check In" target={<CheckInForm workspaceId={workspace.id} user={user} />} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}

type CheckInFormProps = {
    workspaceId: string;
    user: User;
};

export function CheckInForm({ workspaceId, user }: CheckInFormProps) {
    const handleSubmit = async (values: { checkIn: string }) => {
        let client = stream.connect(
            "",
            "",
            "",
        );

        try {
            const userToken = await LocalStorage.getItem("stream_token");

            if (!userToken) {
                showToast({
                    title: "Storage Error",
                    message: "Failed to load Stream token from storage",
                    style: Toast.Style.Failure,
                });
                return;
            }

            const feed = client.feed(`${workspaceId}_feed`, user.id);

            feed.addActivity({
                actor: user.name,
                verb: "check-in",
                object: "text",
                message: values.checkIn,
            });

            showToast({
                title: "Check-In Submitted",
                message: `Workspace: ${workspaceId}, Check-In: ${values.checkIn}`,
                style: Toast.Style.Success,
            });
        } catch (error) {
            showToast({
                title: "Failed to submit check-in",
                message: error instanceof Error ? error.message : "Unknown error",
                style: Toast.Style.Failure,
            });
        }
    };

    return (
        <Form
            navigationTitle={`Daily Check-In`}
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