import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [deposit, setDeposit] = useState('');
  const [autoDeposit, setAutoDeposit] = useState('');
  const [type, setType] = useState<'item' | 'service'>('item');
  // Service-specific state
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [verificationDocs, setVerificationDocs] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');
  const [userBadges, setUserBadges] = useState<any[]>([]);
  // Fetch user badges if service selected
  useEffect(() => {
    if (type === 'service' && user?.id) {
      supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id).then(({ data }) => {
        setUserBadges(data || []);
      });
    }
  }, [type, user]);
  // Service: handle portfolio image upload
  const handlePortfolioUpload = async (files: FileList) => {
    if (!user?.id) return;
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
        continue;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/portfolio/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      newImages.push(data.publicUrl);
    }
    setPortfolioImages(prev => [...prev, ...newImages]);
  };

  // Service: handle verification doc upload
  const handleDocUpload = async (files: FileList) => {
    if (!user?.id) return;
    const newDocs: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Max 10MB', variant: 'destructive' });
        continue;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/docs/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('verification-docs').upload(fileName, file);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
      const { data } = supabase.storage.from('verification-docs').getPublicUrl(fileName);
      newDocs.push(data.publicUrl);
    }
    setVerificationDocs(prev => [...prev, ...newDocs]);
  };
  // Auto-calculate deposit as 30% of price
  useEffect(() => {
    const priceNum = parseFloat((document.getElementById('price') as HTMLInputElement)?.value || '');
    if (!isNaN(priceNum) && priceNum > 0) {
      const suggested = (priceNum * 0.3).toFixed(2);
      setAutoDeposit(suggested);
      if (!deposit) setDeposit(suggested);
    }
  }, [deposit]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    }
  });

  const handleImageUpload = async (files: FileList) => {
    if (!user?.id) return;
    
    const newImages: string[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select images under 5MB",
          variant: "destructive"
        });
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
        continue;
      }

      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      newImages.push(data.publicUrl);
    }

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const listingType = formData.get('type') as 'item' | 'service';
    const listing = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      price_type: formData.get('price_type') as 'fixed' | 'hourly' | 'per_day' | 'negotiable',
      category_id: formData.get('category_id') as string,
      condition: formData.get('condition') as 'new' | 'like_new' | 'good' | 'fair' | 'poor',
      type: listingType,
      seller_id: user.id,
      images: uploadedImages,
      delivery_options: [formData.get('delivery_option') as 'pickup' | 'delivery' | 'both'],
      visibility: formData.get('visibility') as 'public' | 'private' | 'neighborhood',
      deposit: parseFloat(formData.get('deposit') as string)
    };

    // If service, also insert into services table
    if (listingType === 'service') {
      const { data: service, error: serviceError } = await supabase.from('services').insert([
        {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: categories?.find((c) => c.id === listing.category_id)?.name || '',
          provider_id: user.id,
          images: portfolioImages,
          // schedule and verification docs as JSON fields
          schedule,
          verification_docs: verificationDocs
        }
      ]).select().single();
      if (serviceError) {
        toast({ title: 'Error creating service', description: serviceError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('listings').insert([listing]);

    if (error) {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Listing created!",
        description: "Your item is now available for borrowing"
      });
      navigate('/my-listings');
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Listing</h1>
          <p className="text-muted-foreground">Share an item or offer a service</p>
        </div>

  <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Who can see this listing?</Label>
                <Select name="visibility" defaultValue="public" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (anyone can see)</SelectItem>
                    <SelectItem value="neighborhood">Neighborhood Only</SelectItem>
                    <SelectItem value="private">Private (only you)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="What are you sharing?" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe your item or service in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" value={type} onValueChange={v => setType(v as 'item' | 'service')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Item</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
          {/* Service-specific fields */}
          {type === 'service' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <Label htmlFor="portfolio-images" className="cursor-pointer">
                      <span className="text-primary font-medium">Click to upload portfolio images</span>
                    </Label>
                    <Input
                      id="portfolio-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && handlePortfolioUpload(e.target.files)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB each</p>
                  </div>
                  {portfolioImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {portfolioImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Verification Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <Label htmlFor="verification-docs" className="cursor-pointer">
                      <span className="text-primary font-medium">Click to upload verification docs</span>
                    </Label>
                    <Input
                      id="verification-docs"
                      type="file"
                      multiple
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={e => e.target.files && handleDocUpload(e.target.files)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">PDF, PNG, JPG up to 10MB each</p>
                  </div>
                  {verificationDocs.length > 0 && (
                    <ul className="list-disc ml-6">
                      {verificationDocs.map((doc, idx) => (
                        <li key={idx}><a href={doc} target="_blank" rel="noopener noreferrer" className="text-primary underline">Document {idx + 1}</a></li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {userBadges.length === 0 ? (
                    <span className="text-muted-foreground">No badges earned yet</span>
                  ) : (
                    userBadges.map((b, idx) => (
                      <Badge key={idx} variant="secondary">{b.badges?.name}</Badge>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="schedule">Availability / Schedule</Label>
                  <Textarea
                    id="schedule"
                    placeholder="e.g. Weekdays 9am-5pm, Sat 10am-2pm, Sun off"
                    value={schedule}
                    onChange={e => setSchedule(e.target.value)}
                  />
                </CardContent>
              </Card>
            </>
          )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select name="category_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select name="condition">
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required 
                    onChange={e => {
                      const val = e.target.value;
                      if (!isNaN(Number(val)) && Number(val) > 0) {
                        const suggested = (Number(val) * 0.3).toFixed(2);
                        setAutoDeposit(suggested);
                        if (!deposit) setDeposit(suggested);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_type">Price Type</Label>
                  <Select name="price_type" defaultValue="per_day">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">per Hour</SelectItem>
                      <SelectItem value="per_day">per Day</SelectItem>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Suggested Deposit</Label>
                <Input
                  id="deposit"
                  name="deposit"
                  type="number"
                  step="0.01"
                  placeholder={autoDeposit || '0.00'}
                  value={deposit}
                  onChange={e => setDeposit(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Suggested: {autoDeposit ? `₹${autoDeposit}` : 'Enter price first'} (30% of price, can override)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_option">Delivery Option</Label>
                <Select name="delivery_option" defaultValue="pickup">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup Only</SelectItem>
                    <SelectItem value="delivery">Delivery Available</SelectItem>
                    <SelectItem value="both">Both Options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="images" className="cursor-pointer">
                  <span className="text-primary font-medium">Click to upload images</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 5MB each
                </p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;