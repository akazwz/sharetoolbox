import { Clipboard, IconButton, Input, InputGroup } from "@chakra-ui/react";

export default function LinkResult({ linkId }: { linkId: string }) {
	const link = `${window.location.origin}/s/${linkId}`;
	return (
		<Clipboard.Root w="full" value={link} hidden={!linkId}>
			<Clipboard.Label textStyle="label">Link</Clipboard.Label>
			<InputGroup endElement={<ClipboardIconButton />}>
				<Clipboard.Input asChild>
					<Input />
				</Clipboard.Input>
			</InputGroup>
		</Clipboard.Root>
	);
}

const ClipboardIconButton = () => {
	return (
		<Clipboard.Trigger asChild>
			<IconButton variant="surface" size="xs" me="-2">
				<Clipboard.Indicator />
			</IconButton>
		</Clipboard.Trigger>
	);
};
