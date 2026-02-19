import { useState, useEffect } from 'react';
import type { PurchasedTicket } from '../../types';
import { formatDate } from '../../utils/formatting';

const WORDS_OF_DAY = ['FARE', 'RAIL', 'SEAT', 'PASS'];

export default function AnimatedTicketView({ ticket }: { ticket: PurchasedTicket }) {
  const [showWord, setShowWord] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB'));
  const wordOfDay = WORDS_OF_DAY[new Date().getDate() % WORDS_OF_DAY.length];

  useEffect(() => {
    const wordInterval = setInterval(() => setShowWord(prev => !prev), 3000);
    const timeInterval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => { clearInterval(wordInterval); clearInterval(timeInterval); };
  }, []);

  const gradient = ticket.operatorColor
    ? `linear-gradient(135deg, ${ticket.operatorColor} 0%, ${ticket.operatorColor}dd 100%)`
    : 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(147, 51, 234) 50%, rgb(219, 39, 119) 100%)';

  return (
    <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: gradient }}>
      <style>{`
        @keyframes sf1{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-40px)}50%{transform:translate(-20px,-30px)}75%{transform:translate(40px,20px)}}
        @keyframes sf2{0%,100%{transform:translate(0,0)}25%{transform:translate(-40px,30px)}50%{transform:translate(25px,40px)}75%{transform:translate(-30px,-25px)}}
        @keyframes sf3{0%,100%{transform:translate(0,0)}25%{transform:translate(20px,35px)}50%{transform:translate(-35px,15px)}75%{transform:translate(15px,-40px)}}
      `}</style>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-20 -left-20" style={{ animation: 'sf1 25s ease-in-out infinite' }} />
        <div className="absolute w-48 h-48 bg-white/10 rounded-full -bottom-10 -right-10" style={{ animation: 'sf2 30s ease-in-out infinite' }} />
        <div className="absolute w-32 h-32 bg-white/10 rounded-full top-1/2 left-1/2" style={{ animation: 'sf3 20s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10">
        <div className="text-white/90 text-sm mb-6">
          <div className="flex items-center gap-3 mb-2">
            {ticket.operatorLogo && <span className="text-3xl">{ticket.operatorLogo}</span>}
            <div>
              <p className="font-semibold text-lg">{ticket.operator ?? 'Visual Validation Ticket'}</p>
              <p className="text-white/70">{ticket.reference}</p>
            </div>
          </div>
          {ticket.isPartOfMultiModal && (
            <div className="bg-white/20 rounded px-2 py-1 text-xs inline-block mt-2">
              Ticket {ticket.ticketNumber} of {ticket.totalTickets}
            </div>
          )}
        </div>

        {/* Animated word / time display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 mb-6 min-h-[200px] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${showWord ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-white text-6xl font-bold tracking-widest">{wordOfDay}</div>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${!showWord ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-white text-5xl font-bold">{currentTime}</div>
            </div>
          </div>
        </div>

        <div className="text-white space-y-2">
          {ticket.services ? (
            <>
              <div className="mb-3">
                {ticket.services.map(s => <p key={s} className="font-semibold">{s}</p>)}
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Date</span>
                <span className="font-semibold">{formatDate(ticket.date)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-white/70">From</span><span className="font-semibold">{ticket.journey.from}</span></div>
              <div className="flex justify-between"><span className="text-white/70">To</span><span className="font-semibold">{ticket.journey.to}</span></div>
              <div className="flex justify-between"><span className="text-white/70">Departure</span><span className="font-semibold">{ticket.journey.departure}</span></div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-white/70">Passenger</span>
            <span className="font-semibold">{ticket.passenger}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
