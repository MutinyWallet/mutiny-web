import { useLocation, useNavigate } from "solid-start";
import { BackButton } from "./BackButton";

type StateWithPrevious = {
    previous?: string;
};

export function BackPop() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as StateWithPrevious;

    const backPath = () => (state?.previous ? state?.previous : "/");

    return (
        <BackButton
            title="Back"
            onClick={() => navigate(backPath())}
            showOnDesktop
        />
    );
}
