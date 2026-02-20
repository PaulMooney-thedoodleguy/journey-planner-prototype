import TrainIcon      from '../../assets/icons/modes/train.svg?react';
import BusIcon        from '../../assets/icons/modes/bus.svg?react';
import TramIcon       from '../../assets/icons/modes/tram.svg?react';
import FerryIcon      from '../../assets/icons/modes/ferry.svg?react';
import TubeIcon       from '../../assets/icons/modes/tube.svg?react';
import WalkIcon       from '../../assets/icons/modes/walk.svg?react';
import CycleIcon      from '../../assets/icons/modes/cycle.svg?react';
import MultimodalIcon from '../../assets/icons/modes/multimodal.svg?react';
import type { TransportMode } from '../../types';

const ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  train:      TrainIcon,
  bus:        BusIcon,
  tram:       TramIcon,
  ferry:      FerryIcon,
  tube:       TubeIcon,
  walk:       WalkIcon,
  cycle:      CycleIcon,
  multimodal: MultimodalIcon,
};

export default function ModeIcon({
  mode,
  className = 'w-5 h-5',
}: {
  mode: TransportMode;
  className?: string;
}) {
  const Icon = ICONS[mode] ?? TrainIcon;
  return <Icon className={className} aria-hidden="true" />;
}
