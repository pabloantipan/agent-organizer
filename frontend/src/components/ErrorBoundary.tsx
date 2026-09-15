import { Component, type ReactNode } from "react";

/** A render error inside one tab stays inside that tab: the rest of the
 *  app keeps working and the error is on screen instead of a blank window. */
export class ErrorBoundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(`[${this.props.name}]`, error); }
  render() {
    if (this.state.error) {
      return (
        <div className="empty crashed">
          <b>{this.props.name} failed to render.</b>
          <pre>{String(this.state.error?.stack || this.state.error)}</pre>
          <button className="tiny-btn" onClick={() => this.setState({ error: null })}>try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
