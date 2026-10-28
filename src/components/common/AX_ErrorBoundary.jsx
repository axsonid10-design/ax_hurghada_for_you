import React from 'react'
import { RefreshCw, Home, AlertOctagon, Terminal } from 'lucide-react'
import { AX_alertTelegram } from '../../utils/AX_TelegramAlert'

export class AX_ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    try {
      AX_alertTelegram('REACT_RENDER_CRASH', error, {
        componentStack: errorInfo?.componentStack
      })
    } catch (e) {
      console.error('[AX_WATCHDOG] Failed to report render crash:', e)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const isRtl = document.documentElement.dir !== 'ltr'
      return (
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-800/90 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertOctagon size={34} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isRtl ? 'حدث خطأ غير متوقع في الشاشة' : 'Unexpected Screen Error'}
              </h2>
              <p className="text-sm text-slate-400">
                {isRtl
                  ? 'تم رصد وتوثيق الخطأ تلقائياً في رادار النظام وإشعار المطور فورياً.'
                  : 'The error has been automatically captured and reported to system radar.'}
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/70 border border-slate-700/60 rounded-2xl p-4 text-left font-mono text-xs text-rose-300 overflow-x-auto max-h-36">
                <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-1">
                  <Terminal size={14} />
                  <span>Error Details</span>
                </div>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-transform active:scale-95"
              >
                <RefreshCw size={16} />
                <span>{isRtl ? 'إعادة تحميل الشاشة' : 'Reload Screen'}</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Home size={16} />
                <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
