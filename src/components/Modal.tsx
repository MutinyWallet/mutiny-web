import { ParentComponent, createSignal } from "solid-js";
import Dismiss from "solid-dismiss";
import { Motion, Presence } from "@motionone/solid";
import { Button } from "./Button";

const ModalToggleScrollbar: ParentComponent = (props) => {
    const [open, setOpen] = createSignal(false);
    let btnEl!: HTMLButtonElement;
    let btnSaveEl!: HTMLButtonElement;

    const onClickClose = () => {
        setOpen(false);
    };

    const onClickOverlay = (e: Event) => {
        if (e.target !== e.currentTarget) return;
        setOpen(false);
    };

    // TODO: scrollbar toggle is a think if we're experiencing visual jank
    // https://github.com/aquaductape/solid-dismiss/blob/main/demo/src/components/Examples/ModalToggleScrollbar.tsx

    return (
        <>
            <Button ref={btnEl}>
                Show Peer Connect Info
            </Button>
            <Dismiss
                menuButton={btnEl}
                open={open}
                setOpen={setOpen}
                modal
                focusElementOnOpen={() => btnSaveEl}
            >
                <Presence>
                    <Motion
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            class={"fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-black/50"}
                            onClick={onClickOverlay}
                            role="presentation"
                        >
                            <div class={"relative w-[80vw] max-w-[800px] p-4 bg-gray shadow-xl rounded-xl border border-white"} role="dialog" aria-modal="true" tabindex="-1">
                                {props.children}
                            </div>
                        </div>
                    </Motion>
                </Presence>
            </Dismiss >

        </>
    );
};

export default ModalToggleScrollbar;