import { createReactInlineContentSpec } from "@blocknote/react";

export const serverMention = createReactInlineContentSpec(
  {
    type: "serverMention",
    propSchema: {
      serverId: { default: "" },
      ip: { default: "" },
      nameKo: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { ip, nameKo } = props.inlineContent.props;

      return (
        <span
          title={ip}
          className="mx-0.5 inline-flex items-center rounded border border-primary-300 bg-primary-50 px-1.5 py-px align-baseline font-semibold text-primary-700"
        >
          {nameKo === "" ? ip : nameKo}
        </span>
      );
    },
  },
);
