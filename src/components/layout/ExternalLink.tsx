import { ParentComponent } from "solid-js";

export const ExternalLink: ParentComponent<{ href: string }> = (props) => {
    return (
        <a target="_blank" rel="noopener noreferrer" href={props.href}>
            {props.children}
            <svg
                class="inline-block pl-0.5"
                width="16"
                height="16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6.00002 3.33337v1.33334H10.39L2.66669 12.39l.94333.9434 7.72338-7.72336V10h1.3333V3.33337H6.00002Z"
                    fill="currentColor"
                />
            </svg>
        </a>
    );
};
