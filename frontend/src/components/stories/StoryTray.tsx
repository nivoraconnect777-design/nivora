onClose = {() => setIsCreateModalOpen(false)}
            />

{
    selectedStoryIndex !== null && (
        <StoryViewer
            initialUserIndex={selectedStoryIndex}
            storyUsers={storyUsers}
            onClose={() => setSelectedStoryIndex(null)}
        />
    )
}
        </>
    );
}
