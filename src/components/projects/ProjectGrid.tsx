import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Project } from '../../types/database.types';
import ProjectCard from './ProjectCard';
import ShareModal from './ShareModal';
import { supabase } from '../../lib/supabase';

interface ProjectGridProps {
  searchQuery?: string;
  selectedCategory?: string | null;
}

export default function ProjectGrid({ searchQuery = '', selectedCategory }: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);

      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        if (selectedCategory) {
          query = query.filter('categories', 'cs', `["${selectedCategory}"]`);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [searchQuery, selectedCategory]);

  const handleShare = (project: Project) => {
    setSelectedProject(project);
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">No projects found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery || selectedCategory
            ? 'Try adjusting your search or filters'
            : 'Projects will appear here once they are added'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onShare={handleShare}
          />
        ))}
      </div>

      {selectedProject && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          project={selectedProject}
        />
      )}
    </>
  );
}