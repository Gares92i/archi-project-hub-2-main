
import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Building } from "lucide-react";
import { ClientData, getAllClients, addClient, updateClient, deleteClient } from "@/components/services/clientService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Clients = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  
  // État pour le formulaire de client
  const [clientForm, setClientForm] = useState<Omit<ClientData, "id" | "projectIds">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: ""
  });
  
  // État pour le formulaire de modification
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  
  // Charger les clients
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast.error("Impossible de charger les clients");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadClients();
  }, [loadClients]);
  
  // Filtrer les clients en fonction de la recherche
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      client =>
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
    );
    
    setFilteredClients(filtered);
  };
  
  // Trier les clients
  const handleSort = (option: string) => {
    setSortOption(option);
    let sorted = [...filteredClients];
    
    switch (option) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "company-asc":
        sorted.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "company-desc":
        sorted.sort((a, b) => b.company.localeCompare(a.company));
        break;
      default:
        break;
    }
    
    setFilteredClients(sorted);
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setClientForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: ""
    });
  };
  
  // Gérer la création d'un client
  const handleCreateClient = async () => {
    try {
      if (!clientForm.name) {
        toast.error("Le nom du client est requis");
        return;
      }
      
      await addClient({
        ...clientForm,
        projectIds: []
      });
      
      resetForm();
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      toast.error("Impossible de créer le client");
    }
  };
  
  // Gérer la mise à jour d'un client
  const handleUpdateClient = async () => {
    try {
      if (!editingClient || !editingClient.id) return;
      
      await updateClient(editingClient.id, {
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone,
        address: editingClient.address,
        company: editingClient.company
      });
      
      setEditingClient(null);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      toast.error("Impossible de mettre à jour le client");
    }
  };
  
  // Gérer la suppression d'un client
  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      toast.error("Impossible de supprimer le client");
    }
  };
  
  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Clients</h1>
            <p className="text-muted-foreground">
              Gérez tous vos clients en un seul endroit
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau client à votre liste de contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom*</Label>
                  <Input
                    id="name"
                    placeholder="Nom du client"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Société</Label>
                  <Input
                    id="company"
                    placeholder="Nom de l'entreprise"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="01 23 45 67 89"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Adresse complète"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={handleCreateClient}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={sortOption} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
            <SelectItem value="company-asc">Société (A-Z)</SelectItem>
            <SelectItem value="company-desc">Société (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleSearch}>
          Filtrer
        </Button>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des clients...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Société</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Aucun client trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.company}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                        <TableCell className="hidden lg:table-cell">{client.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingClient(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Modifier le client</DialogTitle>
                                  <DialogDescription>
                                    Modifiez les informations du client.
                                  </DialogDescription>
                                </DialogHeader>
                                {editingClient && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Nom*</Label>
                                      <Input
                                        id="edit-name"
                                        value={editingClient.name}
                                        onChange={(e) =>
                                          setEditingClient({ ...editingClient, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-company">Société</Label>
                                      <Input
                                        id="edit-company"
                                        value={editingClient.company}
                                        onChange={(e) =>
                                          setEditingClient({ ...editingClient, company: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">Email</Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingClient.email}
                                        onChange={(e) =>
                                          setEditingClient({ ...editingClient, email: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-phone">Téléphone</Label>
                                      <Input
                                        id="edit-phone"
                                        value={editingClient.phone}
                                        onChange={(e) =>
                                          setEditingClient({ ...editingClient, phone: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-address">Adresse</Label>
                                      <Input
                                        id="edit-address"
                                        value={editingClient.address}
                                        onChange={(e) =>
                                          setEditingClient({ ...editingClient, address: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button onClick={handleUpdateClient}>Enregistrer</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cards">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des clients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClients.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">Aucun client trouvé</p>
                  <p className="text-muted-foreground">Ajoutez un nouveau client pour commencer</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <Card key={client.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{client.name}</CardTitle>
                      <CardDescription>{client.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {client.email && (
                          <div className="flex items-center">
                            <span className="font-medium min-w-24">Email:</span>
                            <span className="text-muted-foreground">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center">
                            <span className="font-medium min-w-24">Téléphone:</span>
                            <span className="text-muted-foreground">{client.phone}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center">
                            <span className="font-medium min-w-24">Adresse:</span>
                            <span className="text-muted-foreground">{client.address}</span>
                          </div>
                        )}
                        {client.projectIds && client.projectIds.length > 0 && (
                          <div className="flex items-start">
                            <span className="font-medium min-w-24">Projets:</span>
                            <span className="text-muted-foreground">
                              {client.projectIds.length} projet(s)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingClient(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Modifier le client</DialogTitle>
                              <DialogDescription>
                                Modifiez les informations du client.
                              </DialogDescription>
                            </DialogHeader>
                            {editingClient && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name-card">Nom*</Label>
                                  <Input
                                    id="edit-name-card"
                                    value={editingClient.name}
                                    onChange={(e) =>
                                      setEditingClient({ ...editingClient, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-company-card">Société</Label>
                                  <Input
                                    id="edit-company-card"
                                    value={editingClient.company}
                                    onChange={(e) =>
                                      setEditingClient({ ...editingClient, company: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email-card">Email</Label>
                                  <Input
                                    id="edit-email-card"
                                    type="email"
                                    value={editingClient.email}
                                    onChange={(e) =>
                                      setEditingClient({ ...editingClient, email: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-phone-card">Téléphone</Label>
                                  <Input
                                    id="edit-phone-card"
                                    value={editingClient.phone}
                                    onChange={(e) =>
                                      setEditingClient({ ...editingClient, phone: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-address-card">Adresse</Label>
                                  <Input
                                    id="edit-address-card"
                                    value={editingClient.address}
                                    onChange={(e) =>
                                      setEditingClient({ ...editingClient, address: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <Button onClick={handleUpdateClient}>Enregistrer</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Clients;
