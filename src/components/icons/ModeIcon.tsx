import {
  MdTrain,
  MdDirectionsBus,
  MdTram,
  MdDirectionsBoat,
  MdDirectionsSubway,
  MdDirectionsWalk,
  MdDirectionsBike,
  MdSyncAlt,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import type { TransportMode } from '../../types';

const ICONS: Record<string, IconType> = {
  train:      MdTrain,
  bus:        MdDirectionsBus,
  tram:       MdTram,
  ferry:      MdDirectionsBoat,
  tube:       MdDirectionsSubway,
  walk:       MdDirectionsWalk,
  cycle:      MdDirectionsBike,
  multimodal: MdSyncAlt,
};

export default function ModeIcon({
  mode,
  className = 'w-5 h-5',
}: {
  mode: TransportMode;
  className?: string;
}) {
  const Icon = ICONS[mode] ?? MdTrain;
  return <Icon className={className} aria-hidden="true" />;
}
