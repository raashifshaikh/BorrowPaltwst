import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [availability, setAvailability] = useState('all');
  const [depositRange, setDepositRange] = useState('all');
  const [paymentType, setPaymentType] = useState('all');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    }
  });

  // Helper to get average rating (mocked for now, replace with real data)
  const getLenderReputation = (listing) => {
    // Replace with actual logic to fetch lender's reputation/ratings
    return listing.seller_reputation || 4.5;
  };
  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', searchTerm, selectedCategory, sortBy, availability, depositRange, paymentType],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          categories (name)
        `)
        .eq('status', 'active');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }
      if (availability !== 'all') {
        query = query.eq('availability', availability);
      }
      if (depositRange !== 'all') {
        if (depositRange === 'low') query = query.lte('deposit', 100);
        if (depositRange === 'medium') query = query.gte('deposit', 100).lte('deposit', 500);
        if (depositRange === 'high') query = query.gte('deposit', 500);
      }
      if (paymentType !== 'all') {
        query = query.eq('payment_type', paymentType);
      }

      query = query.order(sortBy, { ascending: false });

      const { data } = await query;
      return data || [];
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Items</h1>
          <p className="text-muted-foreground">Find what you need to borrow</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="views_count">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          {/* Availability Filter */}
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          {/* Deposit Filter */}
          <Select value={depositRange} onValueChange={setDepositRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Deposit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deposits</SelectItem>
              <SelectItem value="low">Low (&lt; ₹100)</SelectItem>
              <SelectItem value="medium">Medium (₹100-₹500)</SelectItem>
              <SelectItem value="high">High (&gt; ₹500)</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Type Filter */}
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Types</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="online">Online Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Map View */}
        {listings && listings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Map View</h2>
            <div className="w-full h-80 rounded-lg overflow-hidden">
              <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {listings.filter(l => l.location && l.location.lat && l.location.lng).map((listing) => (
                  <Marker key={listing.id} position={[listing.location.lat, listing.location.lng]}>
                    <Popup>
                      <strong>{listing.title}</strong><br />
                      {listing.categories?.name}<br />
                      ₹{listing.price} / {listing.price_type}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings?.map((listing) => (
              <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Reputation: {getLenderReputation(listing)}★</Badge>
                      </div>
                    </div>
                    <Badge variant="outline">
                      ₹{listing.price}/{listing.price_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {listing.categories?.name && (
                      <span>{listing.categories.name}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>
                  {listing.location && typeof listing.location === 'object' && 'city' in listing.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{(listing.location as any).city}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Link to={`/listing/${listing.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {listings?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Browse;