import { createReactInlineContentSpec } from "@blocknote/react";

export const personMention = createReactInlineContentSpec(
  {
    type: "personMention",
    propSchema: {
      accountId: { default: "" },
      loginId: { default: "" },
      name: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { loginId, name } = props.inlineContent.props;

      return (
        <span
          title={loginId}
          className="mx-0.5 inline-flex items-center rounded border border-up-500/40 bg-up-500/10 px-1.5 py-px align-baseline font-semibold text-up-500"
        >
          @{name === "" ? loginId : name}
        </span>
      );
    },
  },
);
