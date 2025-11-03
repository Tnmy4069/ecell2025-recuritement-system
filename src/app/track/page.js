'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackApplication() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const response = await fetch('/api/applications/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsappNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400 text-black';
      case 'shortlisted':
        return 'bg-blue-500 text-white';
      case 'selected':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'ABSENT';
      case 'shortlisted':
        return '📋';
      case 'selected':
        return '🎉';
      case 'rejected':
        return '🤞';
      default:
        return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black border-b-4 border-black">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-white tracking-tight">TRACK APPLICATION</h1>
            <Link href="/" className="bg-yellow-400 text-black font-bold px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px]">
              ← BACK TO FORM
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Search Form */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 mb-12">
            <h2 className="text-4xl font-black text-black mb-8 text-center tracking-tight">
              TRACK YOUR STATUS
            </h2>
            
            <form onSubmit={handleTrack} className="space-y-8">
              <div>
                <label className="block text-black font-bold text-lg mb-4">
                  WHATSAPP NUMBER
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full p-4 text-lg border-4 border-black font-bold bg-gray-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  placeholder="Enter your WhatsApp number"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500 text-white font-bold p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-black py-6 px-8 text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {loading ? 'SEARCHING...' : 'TRACK APPLICATION 🔍'}
              </button>
            </form>
          </div>

          {/* Application Details */}
          {application && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10">
              <div className="text-center mb-10">
                <div className="text-8xl mb-6">
                  {getStatusIcon(application.status)}
                </div>
                <h3 className="text-3xl font-black text-black mb-6 tracking-tight">
                  HI, {application.fullName.toUpperCase()}!
                </h3>
                <div className={`inline-flex items-center px-8 py-4 border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(application.status)}`}>
                  STATUS: {application.status === 'rejected' ? 'NOT SELECTED' : application.status.toUpperCase()}
                </div>
              </div>

              <div className="space-y-6 text-black">
                <div className="bg-gray-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-black text-lg mb-3">📧 EMAIL</h4>
                  <p className="font-bold text-gray-800">{application.email}</p>
                </div>

                <div className="bg-gray-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-black text-lg mb-3">📅 SUBMITTED AT</h4>
                  <p className="font-bold text-gray-800">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'SUBMISSION DATE NOT AVAILABLE'}
                  </p>
                </div>

                <div className="bg-gray-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-black text-lg mb-3">🔄 LAST UPDATED</h4>
                  <p className="font-bold text-gray-800">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'NOT UPDATED YET'}
                  </p>
                </div>

                {application.status === 'selected' && (
                  <div className="bg-green-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="font-black text-2xl mb-6 text-black">🎉 HEY CHANGEMAKER,</h4>
                    <div className="space-y-6 text-black font-bold">
                      <p className="text-xl font-black">
                        First, take a second to smile — because you&apos;ve just been shortlisted into the E‑Cell MET Core Team 2025–26 🎉
                      </p>
                      <p>
                        This isn&apos;t just a selection. It&apos;s an invitation. An invitation into a family that doesn&apos;t just work together, but creates, chills, and contributes together.
                      </p>
                      <p>
                        From today, you&apos;re not just a student volunteer — you&apos;re a co‑architect of experiences that will light up the campus. You&apos;ll be part of late‑night brainstorms that turn into wild ideas, hectic days that somehow feel like festivals, and memories that will outlast every poster and stage light.
                      </p>
                      <p className="font-black text-lg">
                        Congratulations once again — welcome to the family. Let&apos;s give our best to what&apos;s coming, and let&apos;s make this semester unforgettable.
                      </p>
                      <div className="text-right">
                        <p className="font-black text-lg">
                          WITH EXCITEMENT,<br />
                          TEAM E‑CELL MET
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="bg-orange-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="font-black text-2xl mb-6 text-black">🌟 A MESSAGE FOR YOU</h4>
                    <div className="space-y-6 text-black font-bold">
                      <p className="text-xl font-black">
                        &ldquo;This isn&apos;t a no, it&apos;s a not-now&rdquo;
                      </p>
                      <p>
                        First off — thank you. Truly.
We were overwhelmed by the passion, ideas, and energy that came through during the interviews. You were amazing, and it wasn&apos;t an easy call.

That said, for this tenure, we&apos;ve shortlisted students who could contribute across multiple verticals — not just for now, but for the long-term vision we&apos;re building.
                      </p>
                      <p>
                       But this isn&apos;t a rejection. It&apos;s a redirection.
Take this time to polish your skills, explore new domains, and build your own thing — free from the corporate box. And hey, we&apos;re not going anywhere.
                      </p>
                      <p className="font-black text-lg">
                        Remember: Every &lsquo;not-now&rsquo; is preparing you for a bigger &lsquo;yes&rsquo; in the future! 🚀
                         E-Cell MET has a lot of fun, high-energy initiatives coming up — and we&apos;d love to see you participate, vibe, and grow with us.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 p-6 bg-purple-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-black text-xl text-black mb-4">📞 NEED HELP?</h4>
                <p className="text-black font-bold">
                  If you have any questions about your application status, reach out to us at{' '}
                  <a href="mailto:new_family@ecellmet.tech" className="underline hover:no-underline font-black">
                    new_family@ecellmet.tech
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
