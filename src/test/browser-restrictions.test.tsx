import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrowserRestrictions } from "@/components/cnh/BrowserRestrictions";
afterEach(cleanup);
describe("Requested zoom restrictions", () => {
  it("cancels Ctrl-wheel zoom without canceling ordinary scrolling", () => {
    render(<BrowserRestrictions />);
    const zoom = new WheelEvent("wheel", { ctrlKey: true, deltaY: -20, cancelable: true });
    document.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(true);
    const scroll = new WheelEvent("wheel", { deltaY: 20, cancelable: true });
    document.dispatchEvent(scroll);
    expect(scroll.defaultPrevented).toBe(false);
  });
  it("cancels zoom shortcuts but leaves inspection shortcuts available", () => {
    render(<BrowserRestrictions />);
    const zoom = new KeyboardEvent("keydown", { ctrlKey: true, key: "+", cancelable: true });
    document.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(true);
    const inspect = new KeyboardEvent("keydown", { key: "F12", cancelable: true });
    document.dispatchEvent(inspect);
    expect(inspect.defaultPrevented).toBe(false);
  });
});