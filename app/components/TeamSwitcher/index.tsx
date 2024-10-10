'use client';

import { Team } from '@prisma/client';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { switchTeam } from '@/app/components/TeamSwitcher/actions';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  usersTeams?: Team[] | null;
  currentTeamId?: string;
}

export function TeamSwitcher({ usersTeams, currentTeamId }: Props) {
  const [open, setOpen] = useState(false);

  const currentTeam = usersTeams?.find((team) => team.id === currentTeamId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className="w-[70px] justify-between"
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${currentTeam?.id}.png`}
                alt={currentTeam?.id}
                className="grayscale"
              />
              <AvatarFallback>
                {currentTeam?.name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              {usersTeams?.map((team) => {
                return (
                  <CommandItem
                    key={team.id}
                    onSelect={async () => {
                      await switchTeam(team.id);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${team.id}.png`}
                        alt={team.id}
                        className="grayscale"
                      />
                      <AvatarFallback>
                        {team?.name?.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    /{team.name}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        team?.id === currentTeamId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandList>
            <CommandSeparator />
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
