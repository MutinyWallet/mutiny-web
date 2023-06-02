import { Back } from "~/assets/svg/Back";

export function BackButton(props: {
  onClick: () => void;
  title?: string;
  showOnDesktop?: boolean;
}) {
  return (
    <button
      onClick={() => props.onClick()}
      class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline md:hidden flex items-center"
      classList={{ "md:!flex": props.showOnDesktop }}
    >
      <Back />
      {props.title ? props.title : "Home"}
    </button>
  );
}