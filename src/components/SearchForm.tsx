import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Search, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [location, setLocation] = React.useState(searchParams.get('location') || 'chaka');
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined
  );
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined
  );
  const [guests, setGuests] = React.useState(searchParams.get('guests') || '2');

  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (location) params.append('location', location);
    if (guests) params.append('guests', guests);
    if (checkIn) params.append('checkIn', checkIn.toISOString());
    if (checkOut) params.append('checkOut', checkOut.toISOString());

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="h-12 bg-muted/50 border-0 focus:ring-1 focus:ring-primary/20">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chaka">Chaka Town</SelectItem>
                <SelectItem value="nyeri">Nyeri</SelectItem>
                <SelectItem value="nanyuki">Nanyuki</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Check In</Label>
            <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal bg-muted/50 border-0 hover:bg-muted"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {checkIn ? <span className="truncate">{format(checkIn, "LLL dd, y")}</span> : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date);
                    setCheckInOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Check Out</Label>
            <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal bg-muted/50 border-0 hover:bg-muted"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {checkOut ? <span className="truncate">{format(checkOut, "LLL dd, y")}</span> : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => {
                    setCheckOut(date);
                    setCheckOutOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="h-12 pr-10 bg-muted/50 border-0 focus:ring-1 focus:ring-primary/20"
                />
                <Users className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
              </div>
              <Button type="submit" className="h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-transform active:scale-95">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
