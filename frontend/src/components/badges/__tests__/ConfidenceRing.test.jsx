import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ConfidenceRing from "../ConfidenceRing.jsx";

describe("ConfidenceRing", () => {
  it("renders the rounded score value", () => {
    render(<ConfidenceRing score={82.4} />);
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("renders a dash when score is missing", () => {
    render(<ConfidenceRing score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
