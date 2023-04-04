import { Outlet } from "solid-start";

export default function UsersLayout() {
    return (
        <div>
            <h1>Users</h1>
            <Outlet />
        </div>
    );
}