import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const genders = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const roasts = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'dark', label: 'Dark' },
];

const brewMethods = [
  { value: 'espresso', label: 'Espresso' },
  { value: 'pour-over', label: 'Pour-over' },
  { value: 'cold-brew', label: 'Cold brew' },
  { value: 'french-press', label: 'French press' },
  { value: 'aeropress', label: 'Aeropress' },
  { value: 'v60', label: 'V60' },
];

const ageRanges = [
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' },
  { value: '55+', label: '55+' },
];

const coffeeSpends = [
  { value: 'under-5', label: 'Under €5' },
  { value: '5-10', label: '€5–10' },
  { value: '10-15', label: '€10–15' },
  { value: '15-plus', label: '€15+' },
];

const referralSources = [
  { value: 'word-of-mouth', label: 'Word of mouth' },
  { value: 'social-media', label: 'Social media' },
  { value: 'search', label: 'Search engine' },
  { value: 'other', label: 'Other' },
];

const occupations = [
  { value: 'remote-worker', label: 'Remote worker' },
  { value: 'student', label: 'Student' },
  { value: 'office-worker', label: 'Office worker' },
  { value: 'other', label: 'Other' },
];

function OptionGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
            value === o.value
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState(null);
  const [favoriteRoast, setFavoriteRoast] = useState(null);
  const [favoriteBrewMethod, setFavoriteBrewMethod] = useState(null);
  const [ageRange, setAgeRange] = useState(null);
  const [coffeeSpend, setCoffeeSpend] = useState(null);
  const [referralSource, setReferralSource] = useState(null);
  const [occupation, setOccupation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finish = async (data) => {
    setError('');
    setSaving(true);
    try {
      await updateProfile({ ...data, onboardingSeen: true });
      navigate('/explore');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleContinue = () => finish({
    gender, favoriteRoast, favoriteBrewMethod,
    ageRange, coffeeSpend, referralSource, occupation,
  });
  const handleSkip = () => finish({});

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Welcome to Beantrip</h1>
      <p className="text-[var(--color-muted-fg)] mt-2">
        A couple of quick questions to personalize your experience — totally optional. See our{' '}
        <a href="/privacy" target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy Policy</a>{' '}
        for how this is used.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        <div>
          <p className="text-sm font-semibold mb-3">Gender</p>
          <OptionGroup options={genders} value={gender} onChange={setGender} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Age range</p>
          <OptionGroup options={ageRanges} value={ageRange} onChange={setAgeRange} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Favorite roast</p>
          <OptionGroup options={roasts} value={favoriteRoast} onChange={setFavoriteRoast} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Favorite brewing method</p>
          <OptionGroup options={brewMethods} value={favoriteBrewMethod} onChange={setFavoriteBrewMethod} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">How much do you usually spend per coffee visit?</p>
          <OptionGroup options={coffeeSpends} value={coffeeSpend} onChange={setCoffeeSpend} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">What best describes you?</p>
          <OptionGroup options={occupations} value={occupation} onChange={setOccupation} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">How did you hear about Beantrip?</p>
          <OptionGroup options={referralSources} value={referralSource} onChange={setReferralSource} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-6">{error}</p>}

      <div className="flex gap-3 mt-10">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold text-sm disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
        <button
          onClick={handleSkip}
          disabled={saving}
          className="px-6 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-card)] transition-colors disabled:opacity-60"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
