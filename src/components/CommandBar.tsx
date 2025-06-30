import { RunIcon } from "./icons";

type CommandBarProps = {
    onRun: () => void;
};

export default function CommandBar(props: CommandBarProps) {
    return (
        <div class="flex place-content-end gap-2">
            <ul class="m-5">
                <li>
                    <button onclick={props.onRun}>
                        <RunIcon class="" />
                    </button>
                </li>
            </ul>
        </div>
    );
}
