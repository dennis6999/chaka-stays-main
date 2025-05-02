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

const SearchForm = () => {
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(undefined);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="location" className="text-sm sm:text-base">Location</Label>
          <Select defaultValue="chaka">
            <SelectTrigger id="location" className="h-10 sm:h-11">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chaka">Chaka Town</SelectItem>
              <SelectItem value="nyeri">Nyeri</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm sm:text-base">Check In</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 sm:h-11 justify-start text-left font-normal text-sm sm:text-base"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? (
                  format(checkIn, "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm sm:text-base">Check Out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 sm:h-11 justify-start text-left font-normal text-sm sm:text-base"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? (
                  format(checkOut, "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="guests" className="text-sm sm:text-base">Guests</Label>
          <div className="flex">
            <div className="relative flex-grow">
              <Input 
                id="guests" 
                type="number" 
                min="1" 
                defaultValue="2" 
                className="h-10 sm:h-11 pr-10 text-sm sm:text-base"
              />
              <Users className="absolute right-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <Button type="submit" className="ml-2 h-10 sm:h-11 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
