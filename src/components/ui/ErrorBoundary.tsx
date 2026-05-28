"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Erreur inattendue" };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-red-100 bg-red-50/40 px-6 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-brand-950 mb-1">Une erreur est survenue</p>
          <p className="text-sm text-brand-500">Ce contenu ne peut pas s&apos;afficher pour le moment.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { this.setState({ hasError: false, message: "" }); window.location.reload(); }}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:border-accent hover:text-accent transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Réessayer
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all">
            Accueil
          </Link>
        </div>
      </div>
    );
  }
}
