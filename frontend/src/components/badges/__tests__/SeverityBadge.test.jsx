import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SeverityBadge from "../SeverityBadge.jsx";

describe("SeverityBadge", () => {
  it("renders the human-readable label for a severity value", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });
});
