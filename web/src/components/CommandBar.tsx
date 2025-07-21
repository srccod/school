import { RunIcon } from "./icons";

type CommandBarProps = {
    onRun: () => void;
};

export default function CommandBar(props: CommandBarProps) {
    return (
        <div class="flex place-content-start gap-2 m-3">
            <ul>
                <li>
                    <button onclick={props.onRun}>
                        <RunIcon class="" />
                    </button>
                </li>
            </ul>
        </div>
    );
}
