import { ParentComponent } from "solid-js"

const Card: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class='rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]'>
            {props.title && <header class='text-sm font-semibold uppercase'>{props.title}</header>}
            {props.children}
        </div>

    )
}

export default Card