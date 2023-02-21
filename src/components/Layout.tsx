import { Outlet } from "react-router-dom";

export default function Layout() {
    return (<div className="safe-top safe-left safe-right safe-bottom">
        <div className="disable-scrollbars max-h-screen h-full overflow-y-scroll">
            <Outlet />
        </div>
    </div >)
}