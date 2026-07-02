import Link from "next/link";

export const metadata = {
  title: "Documentation - BNPL Prediction System",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[60px] flex items-center justify-between px-6 lg:px-8">
        <Link href="/" className="font-bold text-[1.05rem] tracking-tight">
          BNPL <span className="text-neon">Prediction</span> System
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-text-secondary hover:text-neon transition-colors"
        >
          Back to Assessment
        </Link>
      </header>

      {/* Main Content */}
      <main className="pt-[100px] pb-24 px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">System Documentation</h1>
        <p className="text-sm text-text-muted mb-10">Technical overview of the AI Credit Scoring System</p>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">1. System Architecture</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            The BNPL Prediction System is decoupled into a high-performance React frontend and a Python machine learning backend.
            The frontend is built with Next.js and styled using Tailwind CSS for a native-app feel. The backend is a Flask REST API
            that serves real-time predictions using a pre-trained XGBoost model and manages on-the-fly dataset generation and retraining.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">2. Dataset Generation</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            The model uses a synthetic dataset of 50,000 transaction records designed to mimic real-world BNPL (Buy Now Pay Later) merchant environments. 
            Customers are grouped into latent risk tiers (Good, Medium Risk, High Risk) which probabilistically determine their behavioral features.
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1.5 ml-2">
            <li><strong>Phone Number:</strong> The primary join predicate for historical repayment labels.</li>
            <li><strong>Volatility Metrics:</strong> <i>Avg Gap Days</i> and <i>Max Gap Days</i> capture cash-flow infrequency.</li>
            <li><strong>Negative Signals:</strong> <i>Insufficient Funds Count</i> and <i>Late Payments</i> serve as the strongest indicators of default.</li>
            <li><strong>Categorical Context:</strong> <i>Merchant Category</i> is One-Hot Encoded to capture vertical purchase variance.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">3. Machine Learning Model</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            The engine runs on an <strong>XGBoost Classifier</strong> calibrated to maximize the area under the ROC curve (AUC).
            Hyperparameters are tuned specifically to handle class imbalance (75% Good / 25% Default ratio).
          </p>
          <div className="bg-surface border border-border rounded-xl p-4 text-sm text-text-secondary">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Model Type:</strong> XGBClassifier</div>
              <div><strong>Estimators:</strong> 500</div>
              <div><strong>Max Depth:</strong> 8</div>
              <div><strong>Learning Rate:</strong> 0.05</div>
              <div><strong>Validation AUC:</strong> ~0.9945</div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">4. Scoring Methodology & Results</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            Upon inference, the model produces three distinct outputs:
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-3 ml-2">
            <li>
              <strong>Risk Ratio:</strong> The raw probability output of the model (range: 0.0 to 1.0).
            </li>
            <li>
              <strong>Credit Score (300 - 850):</strong> The risk ratio mapped to a traditional credit scale. 
              <br/><span className="text-text-muted ml-5">Formula: 300 + (1 - Risk Ratio) * 550</span>
            </li>
            <li>
              <strong>Max Credit Limit (BDT):</strong> A dynamic purchase limit evaluated instantly.
              <br/><span className="text-text-muted ml-5">Formula: Volume * 1.5 * ScoreFactor * SuccessRate - Penalty</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">5. Update Workflow</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            The system is designed to seamlessly integrate new behavioral data. Using the "UPDATE" trigger, the backend asynchronously:
          </p>
          <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1.5 ml-2 mt-3">
            <li>Generates a fresh 50K transaction matrix based on the latest probabilities.</li>
            <li>Re-applies One-Hot Encoding and prepares the tensors.</li>
            <li>Retrains the XGBoost model in a background thread to prevent blocking.</li>
            <li>Hot-swaps the active inference model once validation is passed.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
