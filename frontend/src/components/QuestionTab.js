import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { useToast } from '../context/ToastContext';

const SCALE_OPTIONS = [
  { value: 1, short: 'Strongly\nDisagree', label: 'Strongly Disagree' },
  { value: 2, short: 'Disagree', label: 'Disagree' },
  { value: 3, short: 'Neutral', label: 'Neutral' },
  { value: 4, short: 'Agree', label: 'Agree' },
  { value: 5, short: 'Strongly\nAgree', label: 'Strongly Agree' },
];

const SECTIONS = [
  {
    title: 'Dashboard Usability',
    icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    questions: [
      'The dashboard was easy to use.',
      'The dashboard layout was clear and well organised.',
      'It was easy to navigate between different parts of the dashboard.',
      'The graphs, charts, and other visualisations were easy to understand.',
      'I was able to find the information I needed without unnecessary difficulty.',
    ],
  },
  {
    title: 'Energy Information & Forecasting',
    icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605',
    questions: [
      'The energy-consumption information was presented clearly.',
      'The date or time period represented by the dashboard data was clear.',
      'The energy forecasting information was easy to understand.',
      'I could understand the difference between historical energy information and forecasted information.',
      'The dashboard helped me identify important or unusual patterns in energy consumption.',
    ],
  },
  {
    title: 'Explainable AI',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
    questions: [
      'The dashboard helped me understand the AI-generated energy predictions.',
      'The explanations provided for the AI predictions were easy to understand.',
      'The dashboard helped me understand which factors influenced the AI predictions.',
      'The explanations increased my confidence in interpreting the AI-generated forecasts.',
    ],
  },
  {
    title: 'Overall Experience & Feedback',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    questions: [
      'Overall, I was satisfied with my experience of using the dashboard.',
    ],
  },
];

const FEEDBACK_QUESTIONS = [
  'What feature of the dashboard did you find most useful?',
  'Was there anything in the dashboard that you found difficult or confusing?',
  'Were the AI explanations useful for understanding the energy forecasts? Please briefly explain your answer.',
  'What improvements would you suggest for the dashboard?',
  'Do you have any other comments about your experience of using the dashboard?',
];

const STEP_LABELS = ['Welcome', 'Section A', 'Section B', 'Section C', 'Section D & Feedback'];
const TOTAL_RATING_QUESTIONS = 15;

const REVIEWS = [
  {
    name: 'Patel Parth Piyushbhai',
    email: 'Zxz25jku@uea.ac.uk',
    rating: 5,
    review:
      'I checked the project end-to-end and the interface is really impressive. The prediction and explanation panels are clean, and the AI explanations made it easy to understand every result. Great work!',
  },
  {
    name: 'Amrit Singh',
    email: 'insanamrit07@gmail.com',
    rating: 5,
    review:
      'The dashboard is very intuitive and well designed. I loved the monthly load breakdown and how smoothly I could navigate between the panels. A very professional user experience overall.',
  },
  {
    name: 'Khunsha Tahir',
    email: 'Khushrana2018@gmail.com',
    rating: 4,
    review:
      'Really nice dashboard with clear visualisations. The counterfactual analysis and anomaly detection features are quite useful. I would love to see even more comparison charts in the future.',
  },
  {
    name: 'Mohammadsahil Kureshi',
    email: 'infosahilqureshi@gmail.com',
    rating: 5,
    review:
      'I tested the full workflow — prediction, explanation, anomaly detection and optimization all work perfectly. The dark theme and smooth loading states give it a very professional feel.',
  },
  {
    name: 'Sana Adiriki',
    email: 'jvttsb059@gmail.com',
    rating: 4,
    review:
      'Very good interface, easy to use and navigate. The explanation panel helped me understand why the predictions change with different inputs. Overall an excellent project.',
  },
];

const Stars = ({ count }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width="15" height="15" viewBox="0 0 20 20" fill={i <= count ? '#fbbf24' : '#334155'}>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
    ))}
  </div>
);

const ReviewsSection = () => (
  <Card>
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#f1f5f9' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: '#22d3ee' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          User Reviews
        </h3>
      </div>
      <p className="text-sm mb-5" style={{ color: '#64748b' }}>
        What our testers think about the Explainable AI Dashboard
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVIEWS.map((r) => {
          const initials = r.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
          return (
            <div key={r.email} className="rounded-xl p-5 flex flex-col gap-3" style={{
              border: '1px solid rgba(51, 65, 85, 0.35)',
              background: 'rgba(15, 23, 42, 0.5)',
              transition: 'all 0.2s ease',
            }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center rounded-full font-bold shrink-0"
                  style={{
                    width: 40, height: 40, fontSize: 13,
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.14))',
                    border: '1px solid rgba(6,182,212,0.3)',
                    color: '#22d3ee',
                  }}>
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{r.name}</p>
                  <p className="text-[11px] truncate" style={{ color: '#64748b' }}>{r.email}</p>
                </div>
                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                  Verified
                </span>
              </div>
              <Stars count={r.rating} />
              <p className="text-[13px] leading-relaxed" style={{ color: '#94a3b8' }}>"{r.review}"</p>
            </div>
          );
        })}
      </div>
    </div>
  </Card>
);

const stepQuestionRange = (stepIndex) => {
  const offset = SECTIONS.slice(0, stepIndex).reduce((n, s) => n + s.questions.length, 0);
  const count = SECTIONS[stepIndex].questions.length;
  return [offset + 1, offset + count];
};

const QuestionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [participantId, setParticipantId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(ratings).length;
  const [startQ, endQ] = stepQuestionRange(Math.max(step - 1, 0));

  const isStepComplete = () => {
    if (step === 0) return true;
    const [s, e] = stepQuestionRange(step - 1);
    for (let q = s; q <= e; q++) {
      if (ratings[q] === undefined) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepComplete()) {
      toast({
        title: 'Incomplete',
        description: 'Please answer all questions on this page before continuing.',
        variant: 'warning',
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answeredCount < TOTAL_RATING_QUESTIONS) {
      toast({
        title: 'Survey Incomplete',
        description: `Please answer all ${TOTAL_RATING_QUESTIONS} rating questions (${answeredCount}/${TOTAL_RATING_QUESTIONS} answered).`,
        variant: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const ratingsArray = [];
      for (let q = 1; q <= 15; q++) ratingsArray.push(ratings[q]);
      const feedbackArray = [];
      for (let q = 16; q <= 20; q++) feedbackArray.push((feedback[q] || '').trim());

      const response = await fetch('/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participantId,
          date,
          ratings: ratingsArray,
          feedback: feedbackArray,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to submit');
      }
      setSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit. Make sure the backend is running.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const scaleControl = (qNum) => {
    const selected = ratings[qNum];
    return (
      <div>
        <div className="grid grid-cols-5 gap-1.5">
          {SCALE_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRatings({ ...ratings, [qNum]: opt.value })}
                className="flex flex-col items-center justify-center gap-0.5 px-1 py-2.5 rounded-lg text-center transition-all duration-150"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.12))'
                    : 'rgba(15, 23, 42, 0.5)',
                  border: isSelected
                    ? '1px solid rgba(6, 182, 212, 0.6)'
                    : '1px solid rgba(51, 65, 85, 0.35)',
                  boxShadow: isSelected ? '0 0 14px rgba(6, 182, 212, 0.15)' : 'none',
                }}
              >
                <span className={`text-sm font-bold leading-none ${isSelected ? 'text-cyan-300' : 'text-gray-300'}`}>{opt.value}</span>
                <span className="text-[9px] leading-tight whitespace-pre-line" style={{ color: isSelected ? '#a5f3fc' : '#64748b' }}>{opt.short}</span>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="text-[11px] mt-1.5 text-cyan-400">Selected: {SCALE_OPTIONS.find(o => o.value === selected)?.label}</p>
        )}
      </div>
    );
  };

  const stepCard = (key, title, icon, children) => (
    <div key={key} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(51, 65, 85, 0.25)', background: 'rgba(30, 41, 59, 0.35)', animation: 'fadeIn 0.25s ease' }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)', background: 'rgba(15, 23, 42, 0.4)' }}>
        <span style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee',
        }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
        <div>
          <h4 className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{title}</h4>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  const questionBlock = (qNum, qText) => (
    <div key={qNum} className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[11px] font-bold px-2 py-1 rounded-md shrink-0" style={{
          background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)',
        }}>Q{qNum}</span>
        <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{qText}</p>
      </div>
      {scaleControl(qNum)}
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(34,197,94,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4ade80', boxShadow: '0 0 30px rgba(34,197,94,0.15)',
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-6" style={{ color: '#f1f5f9' }}>Thank You!</h3>
            <p className="text-sm mt-2 max-w-md leading-relaxed" style={{ color: '#94a3b8' }}>
              Your feedback has been recorded. Your responses will contribute to the evaluation of
              the Explainable AI Dashboard for Energy Insights.
            </p>
            <p className="text-xs mt-4" style={{ color: '#64748b' }}>
              Redirecting to the Dashboard...
            </p>
            <Button className="mt-3" onClick={() => navigate('/')}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="px-6 pt-6">
          <h2 className="card-title flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            User Evaluation Questionnaire
          </h2>
          <p className="card-subtitle">Explainable AI Dashboard for Energy Insights</p>

          {/* Step indicator */}
          <div className="mt-5 mb-1 flex items-center gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-cyan-400' : i === step ? 'bg-gradient-to-r from-cyan-400 to-violet-400' : 'bg-gray-700/50'}`} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-medium" style={{ color: '#22d3ee' }}>Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{answeredCount}/{TOTAL_RATING_QUESTIONS} rating answers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            {step === 0 && stepCard('intro', 'Welcome', 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', (
              <div className="space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
                  Thank you for participating in this study. This questionnaire evaluates the usability,
                  clarity and understandability of the Explainable AI Dashboard for Energy Insights after
                  you have used it. Please answer the questions based on your experience.
                </p>

                <div className="rounded-lg p-4" style={{ background: 'rgba(2, 6, 23, 0.4)', border: '1px solid rgba(51, 65, 85, 0.4)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Response scale (Q1–Q15)</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SCALE_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex flex-col items-center px-1 py-2 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(51, 65, 85, 0.35)' }}>
                        <span className="text-sm font-bold" style={{ color: '#94a3b8' }}>{opt.value}</span>
                        <span className="text-[9px] leading-tight whitespace-pre-line text-center" style={{ color: '#64748b' }}>{opt.short}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Participant ID</label>
                    <Input value={participantId} onChange={(e) => setParticipantId(e.target.value)} placeholder="e.g. P01" />
                  </div>
                  <div>
                    <label className="input-label">Date</label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {step >= 1 && step <= 4 && (() => {
              const section = SECTIONS[step - 1];
              return stepCard(section.title, section.title, section.icon, (
                <div className="divide-y divide-gray-700/30">
                  {section.questions.map((qText, qi) => {
                    const offset = SECTIONS.slice(0, step - 1).reduce((n, s) => n + s.questions.length, 0);
                    return questionBlock(offset + qi + 1, qText);
                  })}
                  {step === 4 && (
                    <div className="pt-4 mt-4">
                      <div className="flex items-center gap-3 mb-4" style={{ borderBottom: '1px solid rgba(51,65,85,0.4)', paddingBottom: 12 }}>
                        <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                          Open-Ended
                        </span>
                        <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Additional Feedback (optional)</p>
                      </div>
                      <div className="space-y-5">
                        {FEEDBACK_QUESTIONS.map((qText, qi) => (
                          <div key={qi + 16}>
                            <label className="input-label mb-2 block">Q{qi + 16}. {qText}</label>
                            <textarea
                              rows={3}
                              value={feedback[qi + 16] || ''}
                              onChange={(e) => setFeedback({ ...feedback, [qi + 16]: e.target.value })}
                              className="input w-full resize-y"
                              placeholder="Type your answer here..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(51, 65, 85, 0.4)', background: 'rgba(15, 23, 42, 0.6)' }}>
            {step > 0 ? (
              <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>Back</Button>
            ) : <span />}
            {step < STEP_LABELS.length - 1 ? (
              <Button type="button" onClick={handleNext}>Next</Button>
            ) : (
              <Button type="submit" isLoading={loading} disabled={loading}>Submit Feedback</Button>
            )}
          </div>
        </form>
      </Card>

      <div className="mt-6">
        <ReviewsSection />
      </div>
    </div>
  );
};

export default QuestionTab;
